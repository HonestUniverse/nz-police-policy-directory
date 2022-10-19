import { readFile, writeFile, mkdir } from 'fs/promises';

import type { Policy } from '../schema/Policy.js';

import { toUrlSegment } from '../src/shared/to-url-segment.js';
import * as paths from './util/paths.js';

export type StubPolicyWith<TProps extends keyof Policy> = Omit<Policy, Exclude<keyof Policy, TProps>>
export type StubPolicyWithout<TProps extends keyof Policy> = Omit<Policy, TProps>

const policiesSrc = paths.policies;

/**
 * Some policy names are listed with the word "Part" abbreviated to "Pt".
 */
function transformName(name: string): string {
	if (/Pt\s*\d+/.test(name)) {
		name = name.replace(/Pt\s*(\d+)/, 'Part $1');
	}

	return name;
}

/**
 * TypeScript doesn't automatically narrow a type based on `in`, but a custom typeguard can do this
 */
function hasNameProp(obj: any): obj is { name: string } {
	return typeof obj?.name === 'string';
}

/**
 * Create a stub for each document in a given list of stubs with a shared base
 */
export async function createStubs<TProps extends keyof Policy>(stubsOriginal: StubPolicyWith<TProps>[], baseOriginal: StubPolicyWithout<TProps>) {
	const promises: Promise<unknown>[] = [];

	// Make deep copies
	const base = JSON.parse(JSON.stringify(baseOriginal)) as typeof baseOriginal;
	const stubs = stubsOriginal.map((stub) => JSON.parse(JSON.stringify(stub)) as typeof stubsOriginal[number]);

	if (hasNameProp(base)) {
		base.name = transformName(base.name);
	} else {
		stubs.forEach((stub) => {
			if (hasNameProp(stub)) {
				stub.name = transformName(stub.name);
			}
		});
	}

	for (const stub of stubs) {
		// TypeScript isn't smart enough to infer this type, so a type assertion is necesary
		// It's safe though, since PolicyStubWith<TProps> & PolicyStubWithout<TProps> is, by definition, equivalent to Policy
		const policy: Policy = {
			...stub,
			...base,
		} as Policy;

		const chapterDir = `${policiesSrc}/${toUrlSegment(policy.name)}`;
		const chapterMetadataLocation = `${chapterDir}/metadata.json`;

		promises.push(new Promise<void>((resolve, reject) => {
			// Try to read the file. If it doesn't exist, create a stub page
			readFile(chapterMetadataLocation).catch(() => {
				mkdir(chapterDir, { recursive: true }).then(() => {
					writeFile(chapterMetadataLocation, JSON.stringify(policy, null, '\t'))
				})
				.then(() => {
					console.log(`INFO: Created stub for ${policy.name}`);
					resolve();
				})
				.catch((reason) => {
					console.error(`ERROR: Failed to created stub for ${policy.name}`);
					console.error(reason);
					reject(reason);
				});
			});
		}));
	}

	await Promise.allSettled(promises);
};
