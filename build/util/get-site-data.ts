import { makeRootRelative } from './make-root-relative.js';
import * as paths from './paths.js';

type NavigationItem = {
	path: string,
	name: string,
};

export type SiteData = {
	name: string,
	paths: {
		policies: string,
	},
	navigation: {
		header: NavigationItem[],
		footer?: NavigationItem[],
	},
	contact: {
		email: string,
	},
};

export function getSiteData(): SiteData {
	const siteData: SiteData = {
		name: 'policepolicy.nz',
		// TODO: Move all these paths into the paths util, and use them in the build steps as well
		paths: {
			policies: makeRootRelative(paths.policiesDst),
		},
		navigation: {
			header: [
				{
					path: '/',
					name: 'Home',
				},
				{
					path: makeRootRelative(paths.policiesDst),
					name: 'Policies',
				},
			],
			footer: [
				{
					path: '/about/',
					name: 'About',
				},
				{
					path: '/how-to-use/',
					name: 'How to use this website',
				},
				{
					path: '/accessibility/',
					name: 'Accessibility',
				},
				{
					path: '/contributing/',
					name: 'Contributing',
				},
			],
		},
		contact: {
			email: 'contact@policepolicy.nz',
		},
	};

	return siteData;
}
