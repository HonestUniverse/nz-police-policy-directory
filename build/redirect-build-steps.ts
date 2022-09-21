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
		const oldPolicyIds: Record<string, Record<string, string[]>> = {};
		for (const [policyName, policy] of Object.entries(directory)) {
			if (policy.previousNames) {
				oldPolicyNames[policyName] = policy.previousNames.concat();
			}
			for (const version of policy.versions) {
				if (version.previousIds) {
					oldPolicyIds[policyName] = oldPolicyIds[policyName] ?? {};
					oldPolicyIds[policyName][version.id] = version.previousIds.concat();
				}
			}
		}

		const nameRedirects = Object.entries(oldPolicyNames).flatMap(([currentName, oldNames]) => {
			const policyRedirects: Redirect[] = [];

			for (const oldName of oldNames) {
				policyRedirects.push({
					from: makeRootRelative(`${paths.policiesDst}/${toUrlSegment(oldName)}`),
					to: makeRootRelative(`${paths.policiesDst}/${toUrlSegment(currentName)}`),
					code: HttpStatusCode.MOVED_PERMANENTLY,
				});
			}

			return policyRedirects;
		});

		const idRedirects = Object.entries(oldPolicyIds).flatMap(([currentName, idRedirects]) => {
			const policyRedirects: Redirect[] = [];

			for (const [id, oldIds] of Object.entries(idRedirects)) {
				for (const oldId of oldIds) {
					policyRedirects.push({
						from: makeRootRelative(`${paths.policiesDst}/${toUrlSegment(currentName)}/${oldId}`),
						to: makeRootRelative(`${paths.policiesDst}/${toUrlSegment(currentName)}/${id}`),
						code: HttpStatusCode.MOVED_PERMANENTLY,
					});
				}
			}

			return policyRedirects;
		});

		const allRedirects = [...nameRedirects, ...idRedirects];

		const allRedirectStrings = allRedirects.map((redirect) => {
			const selfRedirect = `${redirect.from} ${redirect.to} ${redirect.code}`;
			const ancestorsRedirect = `${redirect.from}/* ${redirect.to}/:splat ${redirect.code}`;

			return `${selfRedirect}\n${ancestorsRedirect}`;
		});

		const allRedirectsString = allRedirectStrings.join('\n');

		return [
			new WriteFilePlugin('_redirects', allRedirectsString),
		];
	},
};
