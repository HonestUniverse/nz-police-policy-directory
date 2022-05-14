import { toUrlSegment } from './util/to-url-segment.js';

import type { Policy } from '../schema/Policy.js';

import { readAllPolicies } from './read-policy.js';

import * as paths from './build-paths.js';

import type { BuildStep } from './BuildStep.js';

import { policyBuildSteps } from './policy-build-steps.js';
import { directoryBuildSteps } from './directory-build-steps.js';

/**
 * Loop through a set of build steps and gather its plugins.
 */
function gatherBuildStepPlugins<T = unknown>(steps: Record<string, BuildStep<T>>, src: string, dst: string, data: T) {
	const plugins: ReturnType<BuildStep<T>> = [];

	for (const buildStep of Object.values(steps)) {
		const buildStepPlugins = buildStep(src, dst, data);
		plugins.push(...buildStepPlugins);
	}

	return plugins;
}

/**
 * Create all necessary Webpack plugins for policy and directory build steps
 */
export async function createBuildPlugins() {
	const plugins: ReturnType<BuildStep> = [];

	const policiesByName = await readAllPolicies();
	const policiesByNameSafe: Record<string, Policy> = {};

	for (const [policyName, policy] of Object.entries(policiesByName)) {
		const policyNameSafe = toUrlSegment(policyName);
		policiesByNameSafe[policyNameSafe] = policy;

		const policySrcPath = `${paths.policies}/${policyName}`;
		const policyDstPath = `./${policyNameSafe}`;

		plugins.push(...gatherBuildStepPlugins(policyBuildSteps, policySrcPath, policyDstPath, policy));
	}

	plugins.push(...gatherBuildStepPlugins(directoryBuildSteps, paths.src, './', policiesByNameSafe));

	return plugins;
}
