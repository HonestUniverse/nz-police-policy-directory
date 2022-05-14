import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

import { readdir, readFile } from 'fs/promises';

import type { Policy } from '../schema/definitions/Policy.js';
import type { PolicyVersionFile } from '../schema/definitions/PolicyVersionFile.js';

/** Used for file-relative dynamic imports with root-relative paths */
const root = '../';

/**
 * A custom type assertion for the `Policy` type.
 *
 * If the return value is false, this function's `errors` property
 * contains details of exactly why the type assertion failed.
 */
export const validatePolicy: ValidateFunction<Policy> = await (async () => {
	const ajv = new Ajv();

	// `ajv` doesn't understand complex formats by default,
	// they need to be added using `ajv-formats`
	addFormats(ajv, ['date', 'uri', 'uri-reference']);

	// `ajv` needs to know about every schema,
	// so read the directory to automatically find them all, then
	// load and add them all before creating the `ValidateFunction`

	const schemaPath = './schema/definitions';

	const schemaDir = await readdir(schemaPath);
	const schemaFileNamePattern = /\.schema\.json$/;
	const schemaFileNames = schemaDir.filter((fileName) => schemaFileNamePattern.test(fileName));

	const schemaPromises = schemaFileNames.map(async (name) => {
		return (await import(`${root}/${schemaPath}/${name}`, {
			assert: { type: 'json' },
		})).default;
	});

	const schemas = await Promise.all(schemaPromises);
	const policySchemaIndex = schemaFileNames.indexOf('policy.schema.json');
	if (policySchemaIndex === -1) {
		throw new Error('ERROR: Could not find policy schema file');
	}
	const policySchema = schemas[policySchemaIndex];

	for (const [i, schema] of schemas.entries()) {
		const name = schemaFileNames[i];

		ajv.addSchema(schema, name);
	}

	return ajv.compile<Policy>(policySchema);
})();

/**
 * Create a `validateFileSize` function for a given directory.
 */
function getFileSizeValidator(dirName: string) {
	/**
	 * Validates that the recorded `size` of a `PolicyVersionFile`
	 * matches its actual file size.
	 *
	 * On failure, it prints a warning to the console and corrects
	 * the recorded size, but it will not write that correction to disk.
	 */
	return async function validateFileSize(file: PolicyVersionFile): Promise<boolean> {
		const filePath = `${dirName}/${file.path}`;
		const handle = await readFile(filePath);

		const valid = file.size === handle.byteLength;

		if (!valid) {
			console.warn(`WARNING: Incorrect file size for ${filePath}. Was ${file.size}, should be ${handle.byteLength}`);
			file.size = handle.byteLength;
		}

		return valid;
	}
}

/**
 * Loops through all files for a given `Policy` and validates that
 * their recorded sizes equal their actual sizes.
 */
export function validateFileSizes(dirName: string, policy: Policy): Promise<boolean[]> {
	const validateFileSize = getFileSizeValidator(dirName);

	const filePromises: Promise<boolean>[] = [];
	for (const version of policy.versions) {
		filePromises.push(...version.files.map(validateFileSize));
	}

	return Promise.all(filePromises);
}
