import type { Version as PolicyVersion } from './PolicyVersion.js';
import type { Notice } from './Notice.js';

export enum PolicyType {
	GENERAL_INSTRUCTIONS = 'General Instructions',
	COMMISSIONERS_CIRCULAR = 'Commissioner\'s Circular',
	CODE_OF_CONDUCT = 'Code of Conduct',
	POLICE_MANUAL_CHAPTER = 'Police Manual chapter',
	EQUIPMENT_OPERATORS_MANUAL = 'Equipment Operator\'s Manual',

	UNDETERMINED = 'Undetermined',
}

export type Policy = {
	schemaVersion: `${number}.${number}.${number}`,
	name: string,
	previousNames?: string[],
	type: PolicyType,
	obsolete?: true,
	versions: PolicyVersion[],
	notices?: Notice[],
};
