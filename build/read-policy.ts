import { readdir } from 'fs/promises';

import type { Policy } from '../schema/Policy.js';
import { validatePolicy, validateFileSizes } from './validate-policy.js';

import * as paths from './util/paths.js';

/**
 * Reads and validates the metadata file for a `Policy`, and returns that data.
 */
async function readPolicyFile(dirName: string): Promise<Policy> {
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
export async function readAllPolicies(path = paths.policies): Promise<Record<string, Policy>> {
	const dir = await readdir(path, {
		withFileTypes: true,
	});

	const promises: Promise<Policy>[] = [];
	const policies: Record<string, Policy> = {};

	for (const entry of dir) {
		if (!entry.isDirectory()) {
			continue;
		}

		const policyPromise = readPolicyFile(`${path}/${entry.name}`);
		policyPromise
			.then((policy) => policies[entry.name] = policy)
			.catch((reason) => console.error(reason));

		promises.push(policyPromise);
	}

	await Promise.allSettled(promises);

	// Policies are added to `policies` as they are read, so JSON generated
	// from this file may appear out of order. Re-iterate through the directory
	// to build a new object in the correct order, so generated JSON is more
	// intuitive.

	const orderedPolicies: Record<string, Policy> = {};
	for (const entry of dir) {
		if (!entry.isDirectory()) {
			continue;
		}

		if (policies[entry.name]) {
			orderedPolicies[entry.name] = policies[entry.name];
		}
	}

	return orderedPolicies;
}
