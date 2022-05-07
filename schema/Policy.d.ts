import { Version as PolicyVersion } from './PolicyVersion.js';
import { Notice } from './Notice.js';

declare enum PolicyType {
	GENERAL_INSTRUCTIONS = 'General Instructions',
	COMMISSIONERS_CIRCULAR = 'Commissioner\'s Circular',
	CODE_OF_CONDUCT = 'Code of Conduct',
	POLICE_MANUAL_CHAPTER = 'PoliceManualChapter',
}

export type Policy = {
	title: string,
	type: PolicyType,
	versions: PolicyVersion[],
	notices?: Notice[],
};
