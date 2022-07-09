import { makeRootRelative } from './make-root-relative.js';
import * as paths from './paths.js';

export type SiteData = {
	paths: {
		policies: string,
	},
};

export function getSiteData(): SiteData {
	const siteData: SiteData = {
		paths: {
			policies: makeRootRelative(paths.policiesDst),
		},
	};

	return siteData;
}
