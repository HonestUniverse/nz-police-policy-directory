import { StatusCodes as HttpStatusCode } from 'http-status-codes';

import type { RedirectBuildStep } from './BuildStep.js';

import WriteFilePlugin from './util/write-file-plugin.js';

import { makeRootRelative } from './util/make-root-relative.js';
import { toUrlSegment } from './util/to-url-segment.js';
import * as paths from './util/paths.js';

type Redirect = {
	from: string,
	to: string,
	code: HttpStatusCode
};

export const redirectBuildSteps: Record<string, RedirectBuildStep> = {
	/**
	 * Generate the redirects file for all policies
	 */
	createRedirectsFile(src, dst, buildData) {
		const { directory } = buildData;

		const oldPolicyNames: Record<string, string[]> = {};
		for (const [policyName, policy] of Object.entries(directory)) {
			if (policy.previousNames) {
				oldPolicyNames[policyName] = policy.previousNames.concat();
			}
		}
		const allRedirects = Object.entries(oldPolicyNames).map(([currentName, oldNames]) => {
			const policyRedirects: Redirect[] = [];

			for (const oldName of oldNames) {
				policyRedirects.push({
					from: makeRootRelative(`${paths.policiesDst}/${toUrlSegment(oldName)}`),
					to: makeRootRelative(`${paths.policiesDst}/${toUrlSegment(currentName)}`),
					code: HttpStatusCode.MOVED_PERMANENTLY,
				});
			}

			const policyRedirectsString = policyRedirects.map((redirect) => {
				const ancestorsRedirect = `${redirect.from}/* ${redirect.to}/:splat ${redirect.code}`;

				return ancestorsRedirect;
			}).join('\n');

			return policyRedirectsString;
		}).join('\n');

		return [
			new WriteFilePlugin('_redirects', allRedirects),
		];
	},
};
