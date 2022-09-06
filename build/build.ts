import { toUrlSegment } from './util/to-url-segment.js';

import type { Policy } from '../schema/Policy.js';

import { readAllPolicies } from './read-policy.js';

import * as paths from './util/paths.js';
import { getSiteData } from './util/get-site-data.js';

import type { BuildStep } from './BuildStep.js';

import { assetBuildSteps } from './asset-build-steps.js';
import { policyBuildSteps } from './policy-build-steps.js';
import { directoryBuildSteps } from './directory-build-steps.js';
import { contentBuildSteps } from './content-build-steps.js';
import { redirectBuildSteps } from './redirect-build-steps.js';

/**
 * Loop through a set of build steps and gather its plugins.
 */
async function gatherBuildStepPlugins<T = unknown>(steps: Record<string, BuildStep<T>>, src: string, dst: string, data: T) {
	const plugins: ReturnType<BuildStep<T>> = [];

	for (const buildStep of Object.values(steps)) {
		const buildStepPlugins = buildStep(src, dst, data);
		plugins.push(...await buildStepPlugins);
	}

	return plugins;
}

/**
 * Create all necessary Webpack plugins for policy and directory build steps
 */
export async function createBuildPlugins(policiesPath = paths.policies) {
	const siteData = getSiteData();

	const plugins: ReturnType<BuildStep> = [];

	const policiesByName = await readAllPolicies(policiesPath);
	const policiesByNameSafe: Record<string, Policy> = {};

	// Asset build steps
	plugins.push(...await gatherBuildStepPlugins(assetBuildSteps, paths.assets, paths.distAssetsFull, null));

	// Loop through policies and generate each policy's build steps
	for (const [policyName, policy] of Object.entries(policiesByName)) {
		const policyNameSafe = toUrlSegment(policyName);
		policiesByNameSafe[policyNameSafe] = policy;

		const policySrcPath = `${policiesPath}/${policyName}`;
		const policyDstPath = `${paths.policiesDst}/${policyNameSafe}`;

		plugins.push(...await gatherBuildStepPlugins(policyBuildSteps, policySrcPath, policyDstPath, {
			siteData,
			policy,
		}));
	}

	// Static content build steps
	plugins.push(...await gatherBuildStepPlugins(contentBuildSteps, paths.assets, paths.distFull, {
		siteData,
		directory: policiesByNameSafe,
	}));

	// Directory build steps
	plugins.push(...await gatherBuildStepPlugins(directoryBuildSteps, paths.src, paths.policiesDst, {
		siteData,
		directory: policiesByNameSafe,
	}));

	// Redirect build steps
	plugins.push(...await gatherBuildStepPlugins(redirectBuildSteps, paths.src, paths.policiesDst, {
		directory: policiesByName,
	}));

	return plugins;
}
