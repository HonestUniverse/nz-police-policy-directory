import type { Provenance } from './Provenance.js';
import type { Licence } from './Licence.js';
import type { Accessibility } from './Accessibility.js';
import type { Notice } from './Notice.js';

export enum FileType {
	DOC = 'application/msword',
	PDF = 'application/pdf',
	TXT = 'text/plain',
}

export enum DocumentType {
	POLICY = 'Policy',
	OIA_RESPONSE_LETTER = 'OIA response letter',
	CHANGE_NOTE = 'Change note',
	EXPLANATORY_NOTE = 'Explanatory note',
}

export type File = {
	path: string,
	type: FileType,
	documentType?: DocumentType,
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
