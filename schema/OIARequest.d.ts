import { OIAWithholdings } from './OIAWithholdings.js';

export type OIARequest = {
	requester?: string,
	id?: string,
	requestUrl?: string,
	responseUrl?: string,
	withholdings: OIAWithholdings,
};
