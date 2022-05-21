import { toUrlSegment } from './util/to-url-segment.js';

import type { Policy } from '../schema/Policy.js';

import { readAllPolicies } from './read-policy.js';

import * as paths from './util/paths.js';

import type { BuildStep } from './BuildStep.js';

import { assetBuildSteps } from './asset-build-steps.js';
import { policyBuildSteps } from './policy-build-steps.js';
import { directoryBuildSteps } from './directory-build-steps.js';
import { indexBuildSteps } from './index-build-steps.js';

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
	const plugins: ReturnType<BuildStep> = [];

	const policiesByName = await readAllPolicies(policiesPath);
	const policiesByNameSafe: Record<string, Policy> = {};

	plugins.push(...await gatherBuildStepPlugins(assetBuildSteps, paths.assets, paths.distAssetsFull, null));
	plugins.push(...await gatherBuildStepPlugins(indexBuildSteps, paths.assets, paths.distFull, null));

	for (const [policyName, policy] of Object.entries(policiesByName)) {
		const policyNameSafe = toUrlSegment(policyName);
		policiesByNameSafe[policyNameSafe] = policy;

		const policySrcPath = `${policiesPath}/${policyName}`;
		const policyDstPath = `${paths.policiesDst}/${policyNameSafe}`;

		plugins.push(...await gatherBuildStepPlugins(policyBuildSteps, policySrcPath, policyDstPath, policy));
	}

	plugins.push(...await gatherBuildStepPlugins(directoryBuildSteps, paths.src, paths.policiesDst, policiesByNameSafe));

	return plugins;
}
