import semver from 'semver';

import { readdir, writeFile } from 'fs/promises';

import type { Policy } from './definitions/Policy.js';
import type { AccessibilityFeature } from './definitions/AccessibilityFeature.js';

import { validatePolicy } from './validate.js';

/**
 * a `Migration` accepts an argument that should look like a `Policy`,
 * and mutates it to ensure it conforms to the requirements of
 * the relevant schema version.
 */
interface Migration {
	(policy: Policy): void,
}

/**
 * Loop through all policies, and attempt to migrate any with invalid metadata.
 */
async function migrateAll() {
	const srcDir = './src/policies';

	const dir = await readdir(srcDir, {
		withFileTypes: true,
	});

	const promises: Promise<void>[] = [];
	let policiesMigrated = 0;

	// Loop through all metadata files
	for (const entry of dir) {
		if (!entry.isDirectory()) {
			continue;
		}

		const dirName = `${srcDir}/${entry.name}`;
		const dir = await readdir(dirName);

		if (dir.includes('metadata.json') === false) {
			console.warn(`WARNING: No metadata.json file found for ${entry.name}`);
			continue;
		}

		const policy: unknown = (
			await import(`../${srcDir}/${entry.name}/metadata.json`, {
				assert: {
					type: 'json',
				},
			})
		).default;

		// Validate metadata
		const valid = validatePolicy(policy);
		if (valid) {
			continue;
		}

		// If invalid, attempt to migrate
		const migratedPolicy = migrate(policy);
		const migratedValid = validatePolicy(migratedPolicy);
		policiesMigrated += 1;
		console.log(`INFO: Migrated ${entry.name} to ${migratedPolicy.schemaVersion}`);

		// After migration, check validity again
		if (!migratedValid) {
			console.error(validatePolicy.errors);
			console.error(`ERROR: Migrated metadata for ${entry.name} is still invalid after migration`);
			// @ts-expect-error We've lied to TypeScript that this is already a valid policy, but in this condition we've just found it's not
			writeFile(`${srcDir}/${entry.name}/metadata.failed-migration-${migratedPolicy.schemaVersion}.json`, JSON.stringify(policy, null, '\t'));
		} else {
			// Back up previous contents just in case
			writeFile(`${srcDir}/${entry.name}/metadata.backup.json`, JSON.stringify(policy, null, '\t'));
			// If valid, save new contents
			writeFile(`${srcDir}/${entry.name}/metadata.json`, JSON.stringify(migratedPolicy, null, '\t'));
		}
	}

	await Promise.all(promises);

	if (policiesMigrated > 0) {
		console.log(`INFO: Migrated ${policiesMigrated} policies`);
	} else {
		console.log('INFO: No policies needed to be migrated');
	}
}

/**
 * When changes are made to the schema, this function will systematically
 * update existing metadata to match the new schema definition.
 *
 * Because it will be dealing with data that doesn't match the current
 * type definitions, it needs to use type assertions.
 */
function migrate(before: unknown): Policy {
	// Create a deep copy
	const after = JSON.parse(JSON.stringify(before)) as Policy;

	if (typeof after.schemaVersion === 'undefined') {
		after.schemaVersion = '0.1.0';
	}

	for (const [version, migration] of Object.entries(migrations)) {
		if (semver.lt(after.schemaVersion, version)) {
			migration(after);
		}
	}

	return after;
}

/**
 * Any time a new version requires a migration, it should be added
 * in order to this object, which `migrate` loops through.
 */
const migrations: Record<string, Migration> = {
	/**
	 * Changes in v1.0.0
	 *
	 * Added `schemaVersion` root property.
	 *
	 * `provenance` is now an array, in order to account for versions or files that
	 * may have been released several times, which can provide information
	 * on the date range for which that version or file was active.
	 *
	 * `AccessibilityFeature` is now always an object, never a boolean or a string
	 */
	['1.0.0']: function (policy: Policy): void {
		policy.schemaVersion = '1.0.0';

		for (const version of policy.versions) {
			// Update version provenance to be an array
			if (Array.isArray(version.provenance) === false) {
				version.provenance = [version.provenance] as unknown as typeof version.provenance;
			}

			for (const file of version.files) {
				// Update file provenance to be an array
				if (file.provenance && Array.isArray(file.provenance) === false) {
					file.provenance = [file.provenance] as unknown as typeof file.provenance;
				}

				// Update file accessibility features to be an object
				for (const [name, feature] of Object.entries(file.accessibility)) {
					if (typeof feature === 'boolean' || typeof feature === 'string') {
						file.accessibility[name] = { value: feature } as AccessibilityFeature;
					}
				}
			}
		}
	},
	/**
	 * Changes in v2.0.0
	 *
	 * A file's `licence` property can no longer be a string, it has to be an object
	 */
	['2.0.0']: function (policy: Policy): void {
		policy.schemaVersion = '2.0.0';

		for (const version of policy.versions) {
			for (const file of version.files) {
				if (typeof file.licence === 'string') {
					file.licence = { name: file.licence };
				}
			}
		}
	},
	/**
	 * Changes in v3.0.0
	 *
	 * `AccessibilityFeature`s now have a `notes` field instead of a `note` field.
	 */
	['3.0.0']: function (policy: Policy): void {
		// TODO: This is commented out while the major version isn't ready yet
		// policy.schemaVersion = '3.0.0';

		for (const version of policy.versions) {
			for (const file of version.files) {
				for (const [name, feature] of Object.entries(file.accessibility)) {
					// @ts-expect-error AccessibilityFeatures no longer have a `note` property
					if (feature.note) {
						// @ts-expect-error AccessibilityFeatures no longer have a `note` property
						feature.notes = [feature.note];
						// @ts-expect-error AccessibilityFeatures no longer have a `note` property
						delete feature.note;
					}
				}
			}
		}
	},
}

migrateAll();
