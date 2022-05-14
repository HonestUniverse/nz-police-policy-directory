import { Provenance } from './Provenance.js';
import { Licence } from './Licence.js';
import { Accessibility } from './Accessibility.js';
import { Notice } from './Notice.js';

declare enum PolicyVersionFileType {
	PDF = 'application/pdf',
	TEXT = 'text/plain',
}

export type PolicyVersionFile = {
	path: string,
	type: PolicyVersionFileType,
	startingPage?: number,
	size: number,
	provenance?: Provenance[],
	licence: Licence,
	original: boolean,
	incomplete?: boolean,
	modifications?: string[],
	accessibility: Accessibility,
	notices?: Notice[],
};
