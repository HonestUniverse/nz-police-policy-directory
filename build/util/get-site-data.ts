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

/**
 * Prepare a path to be used as a navigation link,
 * by making it root-relative and adding a trailing slash if necessary.
 *
 * @param {string} dstPath - The path to prepare for use as a navigation link
 */
function prepareNavPath(dstPath: string): string {
	const rootRelativePath = makeRootRelative(dstPath);

	// Add a trailing slash if it doesn't have one already and it's not a link to a file
	if (/\/$|\/[^.]+\.[^.]+$/.test(rootRelativePath)) {
		return rootRelativePath;
	} else {
		return `${rootRelativePath}/`;
	}
}

export function getSiteData(): SiteData {
	const siteData: SiteData = {
		name: 'policepolicy.nz',
		paths: {
			policies: prepareNavPath(paths.policiesDst),
		},
		navigation: {
			header: [
				{
					path: '/',
					name: 'Home',
				},
				{
					path: prepareNavPath(paths.policiesDst),
					name: 'Policies',
				},
			],
			footer: [
				{
					path: prepareNavPath(paths.aboutDst),
					name: 'About',
				},
				{
					path: prepareNavPath(paths.howToUseDst),
					name: 'How to use this website',
				},
				{
					path: prepareNavPath(paths.accessibilityDst),
					name: 'Accessibility',
				},
				{
					path: prepareNavPath(paths.contributingDst),
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
