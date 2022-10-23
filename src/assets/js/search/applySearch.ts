import { stripAccents } from '../../../shared/to-url-segment.js';

import {
	SearchQuery,
	SearchQueryParam,
} from './SearchQuery.js';

import {
	SearchIndex,
	SearchIndexEntry,
} from '../../../shared/SearchIndex.js';

export enum MatchResult {
	NO_MATCH,
	EMPTY_QUERY,
	TYPE,
	CURRENT_NAME,
	PREVIOUS_NAME,
}

// TODO: Add a relevance value
type SearchResultEntry = {
	match: MatchResult;
};

export type SearchResult = [string, SearchResultEntry][];

/**
 * Apply a `SearchQuery` to a `SearchIndex`
 */
export function applySearch(index: SearchIndex, query: SearchQuery): SearchResult {
	const results: SearchResult = [];

	for (const [key, item] of Object.entries(index)) {
		const itemResult = applySearchToItem(query, item);
		results.push([key, {
			match: itemResult,
		}]);
	}

	return results;
}

/**
 * Hide or show an item based on a `SearchQuery`
 */
function applySearchToItem(query: SearchQuery, item: SearchIndexEntry): MatchResult {
	const isStub = item.isStub;

	if (isStub && !query[SearchQueryParam.INCLUDE_STUBS]) {
		return MatchResult.NO_MATCH;
	}

	const nameMatch = applySearchToItemName(query, item);
	const typeMatch = applySearchToItemType(query, item);

	if (nameMatch === MatchResult.NO_MATCH || typeMatch === MatchResult.NO_MATCH) {
		return MatchResult.NO_MATCH;
	} else if (nameMatch === MatchResult.EMPTY_QUERY) {
		return typeMatch;
	} else if (typeMatch === MatchResult.EMPTY_QUERY) {
		return nameMatch;
	}

	return nameMatch;
}

/**
 * Determine if an item matches the name part of a `SearchQuery`
 */
function applySearchToItemName(query: SearchQuery, item: SearchIndexEntry): MatchResult {
	const {
		[SearchQueryParam.NAME]: name,
	} = query;

	if (name === '') {
		return MatchResult.EMPTY_QUERY;
	} else {
		const itemNames = getItemNames(item);

		for (const [i, itemName] of itemNames.entries()) {
			const match = matchQueryToName(name, itemName);
			if (match) {
				if (i === 0) {
					return MatchResult.CURRENT_NAME;
				} else {
					return MatchResult.PREVIOUS_NAME;
				}
			}
		}

		return MatchResult.NO_MATCH;
	}
}

/**
 * Retrieve an array of a search item's current name and previous names it has.
 */
function getItemNames(item: SearchIndexEntry): string[] {
	const nameAttr = item.name;
	const previousNames = item.previousNames;

	const names = [nameAttr, ...previousNames];

	return names;
}

/**
 * Determine if an item matches the type part of a query
 */
function applySearchToItemType(query: SearchQuery, item: SearchIndexEntry): MatchResult {
	const {
		[SearchQueryParam.TYPE]: type,
	} = query;

	if (type === '') {
		return MatchResult.EMPTY_QUERY;
	} else {
		const itemType = item.type;

		if (itemType === type) {
			return MatchResult.TYPE;
		} else {
			return MatchResult.NO_MATCH;
		}
	}
}

/**
 * Normalise a string and split it into tokens
 */
function tokenise(str: string): string[] {
	let normalisedStr = str;

	normalisedStr = normalisedStr.toLowerCase();
	normalisedStr = stripAccents(normalisedStr);
	// Convert all whitespace to ' '
	normalisedStr = normalisedStr.replace(/\s+/g, ' ');
	// Remove all characters that aren't letters, numbers, or spaces
	normalisedStr = normalisedStr.replace(/[^a-z0-9 ]/g, '');

	const tokens = normalisedStr.split(' ');
	return tokens;
}

/**
 * Determine whether or not a name matches a given query
 */
function matchQueryToName(query: string, name: string) {
	const queryTokens = tokenise(query);
	const nameTokens = tokenise(name);

	const matchFn = matchTokens(nameTokens);

	return queryTokens.every(matchFn);
}

/**
 * Create a function that determines whether or not a string matches against a set of tokens
 */
function matchTokens(tokens: string[]) {
	return (str: string): boolean => {
		for (const token of tokens) {
			if (token.includes(str)) {
				return true;
			}
		}

		return false;
	};
}
