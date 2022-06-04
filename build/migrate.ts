import semver from 'semver';

import { readdir, writeFile } from 'fs/promises';

import { PolicyType } from '../schema/Policy.js';
import type { Policy } from '../schema/Policy.js';

import {
	FileType,
	FileDocumentType,
} from '../schema/File.js';
import type { File as PolicyFile } from '../schema/File.js';

import type { AlternateFile } from '../schema/AlternateFile.js';

import { AccessibilityRating } from '../schema/Accessibility.js';
import type { Accessibility } from '../schema/Accessibility.js';

import { AccessibilityFeatureString } from '../schema/AccessibilityFeature.js';
import type { AccessibilityFeature } from '../schema/AccessibilityFeature.js';

import { OIAWithholdingsSummary } from '../schema/OIAWithholdings.js';

import { validatePolicy } from './validate-policy.js';
import { generateIdsPolicy } from './generate-ids.js';

import * as paths from './util/paths.js';

/**
 * a `Migration` accepts an argument that should look like a `Policy`,
 * and mutates it to ensure it conforms to the requirements of
 * the relevant schema version.
 */
interface Migration {
	(policy: Policy): void,
}

/**
 * Migrate all policies and all test policies
 */
async function migrateAll() {
	let policiesMigrated = 0;

	policiesMigrated += await migrateDir(paths.testPolicies);
	policiesMigrated += await migrateDir(paths.policies);

	if (policiesMigrated > 0) {
		console.log(`INFO: Migrated ${policiesMigrated} policies`);
	} else {
		console.log('INFO: No policies needed to be migrated');
	}
}

/**
 * Loop through all policies, and attempt to migrate any with invalid metadata.
 */
async function migrateDir(path): Promise<number> {
	const dir = await readdir(path, {
		withFileTypes: true,
	});

	const promises: Promise<void>[] = [];
	let policiesMigrated = 0;

	// Loop through all metadata files
	for (const entry of dir) {
		if (!entry.isDirectory()) {
			continue;
		}

		const dirName = `${path}/${entry.name}`;
		const dir = await readdir(dirName);

		if (dir.includes('metadata.json') === false) {
			console.warn(`WARNING: No metadata.json file found for ${entry.name}`);
			continue;
		}

		const policy: unknown = (
			await import(`../${path}/${entry.name}/metadata.json`, {
				assert: {
					type: 'json',
				},
			})
		).default;

		const migratedPolicy = migrate(policy);

		if (JSON.stringify(migratedPolicy) === JSON.stringify(policy)) {
			// If no changes were made, don't consider the policy to have been migrated
			continue;
		}

		const migratedValid = validatePolicy(migratedPolicy);
		policiesMigrated += 1;
		console.log(`INFO: Migrated ${entry.name} to ${migratedPolicy.schemaVersion}`);

		// After migration, check validity again
		if (!migratedValid) {
			console.error(validatePolicy.errors);
			console.error(`ERROR: Migrated metadata for ${entry.name} is still invalid after migration`);
			// @ts-expect-error We've lied to TypeScript that this is already a valid policy, but in this condition we've just found it's not
			writeFile(`${path}/${entry.name}/metadata.failed-migration-${migratedPolicy.schemaVersion}.json`, JSON.stringify(migratedPolicy, null, '\t'));
		} else {
			// Back up previous contents just in case
			writeFile(`${path}/${entry.name}/metadata.backup.json`, JSON.stringify(policy, null, '\t'));
			// If valid, save new contents
			writeFile(`${path}/${entry.name}/metadata.json`, JSON.stringify(migratedPolicy, null, '\t'));
		}
	}

	await Promise.all(promises);

	return policiesMigrated;
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
		after.schemaVersion = '0.0.0';
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
	 * Changes in v0.1.0
	 *
	 * Added `schemaVersion` root property.
	 *
	 * `provenance` is now an array, in order to account for versions or files that
	 * may have been released several times, which can provide information
	 * on the date range for which that version or file was active.
	 *
	 * `AccessibilityFeature` is now always an object, never a boolean or a string
	 */
	['0.1.0']: function (policy: Policy): void {
		policy.schemaVersion = '0.1.0';

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
						// @ts-expect-error This errors because of Accessibility['rating'], which didn't exist prior to v0.3.2
						file.accessibility[name] = { value: feature } as AccessibilityFeature;
					}
				}
			}
		}
	},

	/**
	 * Changes in v0.2.0
	 *
	 * A file's `licence` property can no longer be a string, it has to be an object
	 */
	['0.2.0']: function (policy: Policy): void {
		policy.schemaVersion = '0.2.0';

		for (const version of policy.versions) {
			for (const file of version.files) {
				if (typeof file.licence === 'string') {
					file.licence = { name: file.licence };
				}
			}
		}
	},

	/**
	 * Changes in v0.3.0
	 *
	 * `AccessibilityFeature`s now have a `notes` field instead of a `note` field.
	 */
	['0.3.0']: function (policy: Policy): void {
		policy.schemaVersion = '0.3.0';

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

	/**
	 * Changes in v0.3.1
	 *
	 * Added a new "unwatermarked" `AccessibilityFeature` for rich static media.
	 */
	['0.3.1']: function (policy: Policy): void {
		policy.schemaVersion = '0.3.1';

		for (const version of policy.versions) {
			for (const file of version.files) {
				if (file.type === FileType.PDF) {
					// @ts-expect-error: AccessibilityFeatures have been moved to Accessibility['features']
					file.accessibility.unwatermarked = {
						value: 'Unknown',
						// value: AccessibilityFeatureString.UNKNOWN,
					}
				}
			}
		}
	},

	/**
	 * Changes in v0.3.2
	 *
	 * Added a new optional `rating` property to `Accessibility`.
	 */
	['0.3.2']: function (policy: Policy): void {
		policy.schemaVersion = '0.3.2';

		for (const version of policy.versions) {
			for (const file of version.files) {
				file.accessibility.rating = AccessibilityRating.UNDETERMINED;

				if (file.alternateFiles) {
					for (const altFile of file.alternateFiles) {
						altFile.accessibility.rating = AccessibilityRating.UNDETERMINED;
					}
				}
			}
		}
	},

	/**
	 * Changes in v0.3.3
	 *
	 * Added a new optional `documentType` property to `File`.
	 */
	['0.3.3']: function (policy: Policy): void {
		policy.schemaVersion = '0.3.3';

		for (const version of policy.versions) {
			for (const file of version.files) {
				file.documentType = FileDocumentType.POLICY;
			}
		}
	},

	/**
	 * Changes in v0.4.0
	 *
	 * Updated PolicyType enum "Unclassified" to "Undetermined"
	 *
	 * Made File['documentType'] and AlternateFile['documentType'] required
	 *
	 * Moved AccessibilityFeatures into Accessibility['features']
	 * Updated AccessibilityFeature enum "Unknown" to "Undetermined"
	 *
	 * Updated OIAWithholdings enum "Unknown" to "Undetermined"
	 *
	 * Made Accessibility['Rating'] required
	 *
	 * Updated AccessibilityRating enum to remove `Okay` and add `None`
	 *
	 * Renamed Policy['title'] to 'name'
	 * Renamed Policy['previousTitles'] to 'previousNames'
	 */
	['0.4.0']: function (policy: Policy): void {
		policy.schemaVersion = '0.4.0';

		function migrateFile(file: PolicyFile | AlternateFile) {
			if (!file.documentType) {
				file.documentType = FileDocumentType.POLICY;
			}

			const { accessibility } = file;
			accessibility.rating = AccessibilityRating.UNDETERMINED;

			const a11yFeatures: Partial<Accessibility['features']> = {};
			for (const [featureName, feature] of Object.entries(accessibility)) {
				if (featureName === 'rating') {
					continue;
				}

				// @ts-expect-error AccessibilityFeatures now exist on Accessibility['features']
				if (feature.value === 'Unknown') {
					// @ts-expect-error AccessibilityFeatures now exist on Accessibility['features']
					feature.value = AccessibilityFeatureString.UNDETERMINED;
				}

				a11yFeatures[featureName] = feature;
				delete accessibility[featureName];
			}
			accessibility.features = a11yFeatures as Accessibility['features'];

			// If possible, set accessibility rating based on features
			const { features } = accessibility;

			// Only try to set a rating if all features have been determined
			if (Object.values(features).every((feature) => feature.value !== AccessibilityFeatureString.UNDETERMINED)) {
				if (features['text-based']?.value === false) {
					// Non-text based means "None"
					accessibility.rating = AccessibilityRating.NONE;
				} else if (features['text-based']?.value === AccessibilityFeatureString.PARTIAL) {
					// Only partially text-based means "Bad"
					accessibility.rating = AccessibilityRating.BAD;
				} else if (features['text-based']?.value === true) {
					// If the document is text-based...
					if (Object.values(features).every((feature) => feature.value === true)) {
						// Every accessibility feature must be good for a "Good" rating
						accessibility.rating = AccessibilityRating.GOOD;
					} else {
						// Otherwise, the rating is "Poor"
						accessibility.rating = AccessibilityRating.POOR;
					}
				}
			}
		}

		// @ts-expect-error 'title' is no longer an allowed property
		policy.name = policy.title;
		// @ts-expect-error 'title' is no longer an allowed property
		delete policy.title;

		// @ts-expect-error 'previousTitles' is no longer an allowed property
		policy.previousNames = policy.previousTitles;
		// @ts-expect-error 'previousTitles' is no longer an allowed property
		delete policy.previousTitles;

		// @ts-expect-error 'Unclassified' is no longer a valid PolicyType
		if (policy.type === 'Unclassified') {
			policy.type = PolicyType.UNDETERMINED;
		}

		for (const [i, version] of Object.entries(policy.versions)) {
			for (const provenance of version.provenance) {
				if (provenance.withholdings === 'Unknown') {
					provenance.withholdings = OIAWithholdingsSummary.UNDETERMINED;
				}

				if (provenance.oiaRequest?.withholdings === 'Unknown') {
					provenance.oiaRequest.withholdings = OIAWithholdingsSummary.UNDETERMINED;
				}
			}

			for (const file of version.files) {
				migrateFile(file);

				if (file.alternateFiles) {
					for (const altFile of file.alternateFiles) {
						migrateFile(altFile);
					}
				}
			}
		}
	},

	/**
	 * Changes in v0.4.1
	 *
	 * Made PolicyVersion['name'] optional, and added required field PolicyVersion['id']
	 */
	['0.4.1']: function (policy: Policy): void {
		policy.schemaVersion = '0.4.1';

		const policyWithIds = generateIdsPolicy(policy).policy;
		for (const [i, version] of Object.entries(policy.versions)) {
			version.id = policyWithIds.versions[i].id;
			if (version.name && /\bunnamed version\b/i.test(version.name)) {
				delete version.name;
			}
		}
	},

	/**
	 * Changes in v0.5.0
	 *
	 * Made PolicyFile['incomplete'] an object with a "note" field
	 */
	['0.5.0']: function (policy: Policy): void {
		policy.schemaVersion = '0.5.0';

		for (const version of policy.versions) {
			for (const file of version.files) {
				// Incomplete files require a manual migration to add their note
				if ('incomplete' in file && typeof file.incomplete === 'boolean') {
					file.incomplete = {
						value: file.incomplete,
					};
				}
			}
		}
	},
}

migrateAll();
