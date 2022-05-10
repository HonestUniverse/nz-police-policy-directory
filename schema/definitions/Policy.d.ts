import { Version as PolicyVersion } from './PolicyVersion.js';
import { Notice } from './Notice.js';

declare enum PolicyType {
	GENERAL_INSTRUCTIONS = 'General Instructions',
	COMMISSIONERS_CIRCULAR = 'Commissioner\'s Circular',
	CODE_OF_CONDUCT = 'Code of Conduct',
	POLICE_MANUAL_CHAPTER = 'Police Manual chapter',
	EQUIPMENT_OPERATORS_MANUAL = 'Equipment Operator\'s Manual',

	UNCLASSIFIED = 'Unclassified',
}

export type Policy = {
	schemaVersion: '1.0.0',
	title: string,
	type: PolicyType,
	versions: PolicyVersion[],
	notices?: Notice[],
};
