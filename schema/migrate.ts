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
	const dir = await readdir('./policies', {
		withFileTypes: true,
	});

	const promises: Promise<void>[] = [];

	// Loop through all metadata files
	for (const entry of dir) {
		if (!entry.isDirectory()) {
			continue;
		}

		const dirName = `./policies/${entry.name}`;
		const dir = await readdir(dirName);

		if (dir.includes('metadata.json') === false) {
			console.warn(`WARNING: No metadata.json file found for ${entry.name}`);
			continue;
		}

		const policy: unknown = (
			await import(`../policies/${entry.name}/metadata.json`, {
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

		// After migration, check validity again
		if (!migratedValid) {
			console.error(validatePolicy.errors);
			console.error(`ERROR: Migrated metadata for ${entry.name} is still invalid after migration`);
		}

		// Back up previous contents just in case
		writeFile(`./policies/${entry.name}/metadata.backup.json`, JSON.stringify(policy, null, '\t'));
		// If valid, save new contents
		writeFile(`./policies/${entry.name}/metadata.json`, JSON.stringify(migratedPolicy, null, '\t'));
	}

	await Promise.all(promises);
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
		// @ts-expect-error Explicitly set schemaVersion to a pre-1.0.0 value so if can be migrated to 1.0.0
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
const migrations: Record<string, Migration> = {}

migrateAll();
