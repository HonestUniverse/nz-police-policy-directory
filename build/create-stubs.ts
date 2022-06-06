import { readFile, writeFile, mkdir } from 'fs/promises';

import type { Policy } from '../schema/Policy.js';

import { toUrlSegment } from './util/to-url-segment.js';
import * as paths from './util/paths.js';

type StubPolicy = Omit<Policy, 'name' | 'versions'>;

const policiesSrc = paths.policies;

/**
 * Create a stub for each document in a given list of names
 */
export async function createStubs(names: Policy['name'][], stubPolicy: StubPolicy) {
	const promises: Promise<unknown>[] = [];

	for (let name of names) {
		if (/Pt\s*\d+/.test(name)) {
			name = name.replace(/Pt\s*(\d+)/, 'Part $1');
		}

		const chapter: Policy = {
			name,
			versions: [],
			...stubPolicy,
		};

		const chapterDir = `${policiesSrc}/${toUrlSegment(name)}`;
		const chapterMetadataLocation = `${chapterDir}/metadata.json`;

		promises.push(new Promise<void>((resolve, reject) => {
			// Try to read the file. If it doesn't exist, create a stub page
			readFile(chapterMetadataLocation).catch(() => {
				mkdir(chapterDir, { recursive: true }).then(() => {
					writeFile(chapterMetadataLocation, JSON.stringify(chapter, null, '\t'))
				})
				.then(() => {
					console.log(`INFO: Created stub for ${name}`);
					resolve();
				})
				.catch((reason) => {
					console.error(`ERROR: Failed to created stub for ${name}`);
					console.error(reason);
					reject(reason);
				});
			});
		}));
	}

	await Promise.allSettled(promises);
};
