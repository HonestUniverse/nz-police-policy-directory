import { PolicyVersionDuration } from './PolicyVersionDuration.js';
import { Provenance } from './Provenance.js';
import { File } from './File.js';
import { Notice } from './Notice.js';

export type Version = {
	isFirst?: boolean,
	name?: string,
	id: string,
	previousIds?: string[],
	duration: PolicyVersionDuration,
	provenance: Provenance[],
	files: File[],
	notices?: Notice[],
};
