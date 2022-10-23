import { Policy } from '../../schema/Policy.js';

export type SearchIndexEntry = {
	name: Policy['name'],
	previousNames: NonNullable<Policy['previousNames']>,
	type: Policy['type'],
	isStub: boolean,
};

export type SearchIndex = Record<string, SearchIndexEntry>;

/**
 * Convert a `Policy` to a `SearchIndexEntry`
 */
function toSearchIndexEntry(policy: Policy): SearchIndexEntry {
	const { name, type } = policy;
	const previousNames = policy.previousNames ?? [];
	const isStub = policy.versions.some((version) => version.files.length > 0) === false;

	const entry: SearchIndexEntry = {
		name,
		previousNames,
		type,
		isStub,
	};

	return entry;
}

function isSearchIndexEntry(testData: unknown): testData is SearchIndexEntry {
	const data = testData as SearchIndexEntry;

	if (typeof data !== 'object' || data === null) {
		return false;
	}

	if (typeof data.name !== 'string') {
		return false;
	}

	if (!(
		Array.isArray(data.previousNames) &&
		data.previousNames.every((el) => typeof el === 'string')
	)) {
		return false;
	}

	if (typeof data.isStub !== 'boolean') {
		return false;
	}

	return true;
}

/**
 * Convert a directory of `Policy` objects by name into an equivalent `SearchIndex`
 */
export function toSearchIndex(directory: Record<string, Policy>): SearchIndex {
	const index: SearchIndex = {};

	for (const [key, policy] of Object.entries(directory)) {
		index[key] = toSearchIndexEntry(policy);
	}

	return index;
}

export function isSearchIndex(testData: unknown): testData is SearchIndex {
	const data = testData as SearchIndex;

	if (typeof data !== 'object' || data === null) {
		return false;
	}

	const entries = Object.entries(data);
	if (!entries.every(
		([key, val]) => typeof key === 'string' && isSearchIndexEntry(val)
	)) {
		return false;
	}

	return true;
}
