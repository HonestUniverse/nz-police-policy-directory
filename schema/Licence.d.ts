import { Notice } from './Notice.js';

export type Licence = {
	name: string,
	url?: string,
	notices?: Notice[],
};
