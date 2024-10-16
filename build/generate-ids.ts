import { readdir, writeFile } from 'fs/promises';

import type { Policy } from '../schema/Policy.js';

import { validatePolicy } from './validate-policy.js';

import * as paths from './util/paths.js';

/**
 * Generate IDs for all versions of all policies and all test policies
 */
export async function generateIdsAll() {
	let idsGenerated = 0;

	idsGenerated += await generateIdsDir(paths.testPolicies);
	idsGenerated += await generateIdsDir(paths.policies);

	if (idsGenerated > 0) {
		console.log(`INFO: Generated IDs for ${idsGenerated} versions`);
	} else {
		console.log('INFO: No versions needed to have IDs generated');
	}
}

/**
 * Loop through all policies, and attempt to generate IDs for any version without an ID
 */
async function generateIdsDir(path: string): Promise<number> {
	const dir = await readdir(path, {
		withFileTypes: true,
	});

	const promises: Promise<void>[] = [];
	let idsGenerated = 0;

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

		const policy = ((
			await import(`../${path}/${entry.name}/metadata.json`, {
				assert: {
					type: 'json',
				},
			})
		) as { default: unknown }).default;

		// Because a Policy containing a Version without an "id" attribute is not valid, we can't rely on `validatePolicy`

		try {
			const generateIdsPolicyResult = generateIdsPolicy(policy as Policy);

			if (generateIdsPolicyResult.idsGenerated === 0) {
				// No IDs were generated, so we don't need to write the results
				continue;
			}

			const policyWithIds = generateIdsPolicyResult.policy;

			idsGenerated += generateIdsPolicyResult.idsGenerated;

			console.log(`INFO: Generated ${generateIdsPolicyResult.idsGenerated} IDs for versions of  ${entry.name}`);

			// After version id generation, check validity again
			const resultValid = validatePolicy(policyWithIds);
			if (!resultValid) {
				console.error(validatePolicy.errors);
				console.error(`ERROR: Metadata for ${entry.name} is invalid after ID generation`);
				writeFile(`${path}/${entry.name}/metadata.failed-id-generation.json`, JSON.stringify(policyWithIds, null, '\t'));
			} else {
				// Back up previous contents just in case
				writeFile(`${path}/${entry.name}/metadata.backup.json`, JSON.stringify(policy, null, '\t'));
				// If valid, save new contents
				writeFile(`${path}/${entry.name}/metadata.json`, JSON.stringify(policyWithIds, null, '\t'));
			}
		} catch (e) {
			console.error(`ERROR: ID generation for ${entry.name} failed, perhaps due to invalid metadata`);
			console.error(e);
		}
	}

	await Promise.all(promises);

	return idsGenerated;
}

/**
 * Generate IDs for all versions that don't already have IDs in a given policy
 */
export function generateIdsPolicy(before: Policy): {
	policy: Policy,
	idsGenerated: number,
} {
	// Create a deep copy
	const after = JSON.parse(JSON.stringify(before)) as Policy;
	let idsGenerated = 0;

	if (after.versions) {
		for (const version of after.versions) {
			if (!version.id) {
				version.id = generateUniqueId(after);
				idsGenerated += 1;
			}
		}
	}

	return {
		policy: after,
		idsGenerated,
	};
}

/**
 * Generate a new ID for a policy version. It must be unique within that policy
 */
function generateUniqueId(policy: Policy): string {
	const existingIds = policy.versions.map((version) => version.id).filter((id) => !!id);

	let id: string = generateId();

	while (existingIds.includes(id)) {
		id = generateId();
	}

	return id;
}

/**
 * Generate an ID for a policy version
 */
export function generateId(seed?: number): string {
	// Alphabet with "l", "m", and "r" removed so there's never ambiguity between "i" and "l" or "rn" and "m"
	const idChars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'n', 'o', 'p', 'q', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
	const idPrefix = 'u-';
	const idLength = idPrefix.length + 5;

	if (typeof seed === 'undefined') {
		seed = seed || Math.random();
	}

	// Convert seed to integer by discarding everything up to and including the decimal point
	seed = Number(String(seed).replace(/^\d+\./, ''));

	// ID strings have a prefix of 'u-' to prevent clashes with version names
	let id = idPrefix;

	while (id.length < idLength) {
		id += idChars[seed % idChars.length];
		seed = Math.floor(seed / idChars.length);
	}

	return id;
}
