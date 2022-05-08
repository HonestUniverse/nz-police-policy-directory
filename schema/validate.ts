import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { readdir, readFile } from 'fs/promises';
import type { Dirent } from 'fs';

import type { Policy } from './Policy.js';
import type { PolicyVersionFile } from './PolicyVersionFile.js';

export const validatePolicy = await (async () => {
	const ajv = new Ajv();

	// `ajv` doesn't understand complex formats by default,
	// they need to be added using `ajv-formats`
	addFormats(ajv, ['date', 'uri', 'uri-reference']);

	// `ajv` needs to know about every schema,
	// so read the directory to automatically find them all, then
	// load and add them all before creating the `ValidateFunction`

	const schemaDir = await readdir('./schema');
	const schemaFileNamePattern = /\.schema\.json$/;
	const schemaFileNames = schemaDir.filter((fileName) => schemaFileNamePattern.test(fileName));

	const schemaPromises = schemaFileNames.map(async (name) => {
		return (await import(`./${name}`, {
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

function getFileSizeValidator(dirName: string) {
	return async function validateFileSize(file: PolicyVersionFile) {
		const filePath = `${dirName}/${file.path}`;
		const handle = await readFile(filePath);

		if (file.size !== handle.byteLength) {
			console.warn(`WARNING: Incorrect file size for ${filePath}. Was ${file.size}, should be ${handle.byteLength}`);
			file.size = handle.byteLength;
		}
	}
}

function validateFileSizes(dirName: string, policy: Policy) {
	const validateFileSize = getFileSizeValidator(dirName);

	const filePromises: Promise<void>[] = [];
	for (const version of policy.versions) {
		filePromises.push(...version.files.map(validateFileSize));
	}

	return Promise.all(filePromises);
}

export async function checkPolicyDir(entry: Dirent, directory: Record<string, unknown>) {
	const dirName = `./policies/${entry.name}`;
	const dir = await readdir(dirName);

	if (dir.includes('metadata.json') === false) {
		console.warn(`WARNING: No metadata.json file found for ${entry.name}`);
		return;
	}

	const policy: unknown = (
		await import(`../policies/${entry.name}/metadata.json`, {
			assert: {
				type: 'json',
			},
		})
	).default;

	const valid = validatePolicy(policy);
	if (!valid) {
		console.error(validatePolicy.errors);
		throw new TypeError(`ERROR: Cannot build site due to invalid metadata in ${entry.name}`);
	}

	await validateFileSizes(dirName, policy);

	directory[entry.name] = policy;
}
