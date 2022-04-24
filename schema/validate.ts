import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv();

addFormats(ajv, ['date', 'uri']);

const schemaNames = [
	'policy',
	'policy-file',
	'policy-file-duration',
	'notice',
	'provenance',
];

const schemaPromises = schemaNames.map(async (name) => {
	return (await import(`./${name}.schema.json`, {
		assert: { type: 'json' },
	})).default;
});

const schemas = await Promise.all(schemaPromises);

for (const [i, schema] of schemas.entries()) {
	const name = schemaNames[i];

	ajv.addSchema(schema, name);
}

const validatePolicy = ajv.compile(schemas[0]);

export { validatePolicy };
