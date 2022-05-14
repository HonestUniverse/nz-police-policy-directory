import { readdir } from 'fs/promises';

import type { Policy } from '../schema/Policy.js';
import { validatePolicy, validateFileSizes } from './validate-policy.js';

import * as paths from './build-paths.js';

/**
 * Reads and validates the metadata file for a `Policy`, and returns that data.
 */
async function readPolicyFile(dirName: string): Promise<Policy> {
	// TODO: Throwing errors now stops the build. It should be able to continue
	const policyFolderName = dirName.match(/\/[^\/]+\/?$/)?.[0];

	const dir = await readdir(dirName);

	if (dir.includes('metadata.json') === false) {
		throw new Error(`WARNING: No metadata.json file found for ${policyFolderName}`);
	}

	const policy: unknown = (
		await import(`${paths.root}/${dirName}/metadata.json`, {
			assert: {
				type: 'json',
			},
		})
	).default;

	const valid = validatePolicy(policy);
	if (!valid) {
		console.error(validatePolicy.errors);
		throw new TypeError(`ERROR: Invalid metadata in ${policyFolderName}`);
	}

	await validateFileSizes(dirName, policy);

	return policy;
}

/**
 * Read all policy files, and return an object mapping each
 * policy's paths to its data.
 */
export async function readAllPolicies(): Promise<Record<string, Policy>> {
	const dir = await readdir(paths.policies, {
		withFileTypes: true,
	});

	const promises: Promise<Policy>[] = [];
	const policies: Record<string, Policy> = {};

	for (const entry of dir) {
		if (!entry.isDirectory()) continue;

		const policyPromise = readPolicyFile(`${paths.policies}/${entry.name}`);
		policyPromise.then((policy) => policies[entry.name] = policy);

		promises.push(policyPromise);
	}

	await Promise.allSettled(promises);

	return policies;
}
