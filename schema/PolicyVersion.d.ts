import { PolicyVersionDuration } from './PolicyVersionDuration.js';
import { Provenance } from './Provenance.js';
import { PolicyVersionFile } from './PolicyVersionFile.js';
import { Notice } from './Notice.js';

export type Version = {
	name: string,
	duration: PolicyVersionDuration,
	provenance: Provenance,
	files: PolicyVersionFile[],
	notices?: Notice[],
};
