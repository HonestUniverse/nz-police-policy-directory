import { Notice } from './Notice.js';

export type Licence = 'None' | {
	name: string,
	url?: string,
	notices?: Notice[],
};
