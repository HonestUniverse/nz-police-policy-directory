import { readdir } from 'fs/promises';

import type { Policy } from '../schema/definitions/Policy.js';
import { validatePolicy, validateFileSizes } from './validate-policy.js';

/** Used for file-relative dynamic imports with root-relative paths */
const root = '../';

/**
 * Reads and validates the metadata file for a `Policy`, and returns that data.
 */
export async function readPolicyFile(dirName: string): Promise<Policy> {
	// TODO: Throwing errors now stops the build. It should be able to continue
	const policyFolderName = dirName.match(/\/[^\/]+\/?$/)?.[0];

	const dir = await readdir(dirName);

	if (dir.includes('metadata.json') === false) {
		throw new Error(`WARNING: No metadata.json file found for ${policyFolderName}`);
	}

	const policy: unknown = (
		await import(`${root}/${dirName}/metadata.json`, {
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
