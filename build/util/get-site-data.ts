import { makeRootRelative } from './make-root-relative.js';
import * as paths from './paths.js';

type NavigationItem = {
	path: string,
	name: string,
};

export type SiteData = {
	paths: {
		policies: string,
	},
	navigation: NavigationItem[],
	contact: {
		email: string,
	},
};

export function getSiteData(): SiteData {
	const siteData: SiteData = {
		paths: {
			policies: makeRootRelative(paths.policiesDst),
		},
		navigation: [
			{
				path: '/',
				name: 'Home',
			},
			{
				path: '/about/',
				name: 'About',
			},
			{
				path: '/accessibility/',
				name: 'Accessibility',
			},
		],
	};

	return siteData;
}
