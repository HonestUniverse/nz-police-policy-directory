import { stripAccents } from '../../../../build/util/to-url-segment.js';

import { SearchQuery } from './SearchQuery.js';

enum Selector {
	WRAPPER = '.js-search__item-wrapper',
}

enum DataAttribute {
	NAME = 'data-search-name',
	PREVIOUS_NAMES = 'data-search-previous-names',
	TYPE = 'data-search-type',
	STUB = 'data-search-stub',
}

enum CssClass {
	SHOW_PREVIOUS_NAMES = 'show-previous-names',
}

enum MatchResult {
	NO_MATCH,
	EMPTY_QUERY,
	TYPE,
	CURRENT_NAME,
	PREVIOUS_NAME,
}

/**
 * Apply a `SearchQuery` to a list of searchable `HTMLElement` items
 */
export function applySearch($items: HTMLElement[], query: SearchQuery) {
	const $matchedItems: HTMLElement[] = [];

	for (const $item of $items) {
		const itemResult = applySearchToItem(query, $item);
		const shouldShow = itemResult !== MatchResult.NO_MATCH;
		if (shouldShow) {
			$matchedItems.push($item);
		}

		const $wrapper = $item.closest<HTMLElement>(Selector.WRAPPER) || $item;

		if (shouldShow === $wrapper.hidden) {
			$wrapper.hidden = !shouldShow;
		}

		const previousNameMatch = itemResult === MatchResult.PREVIOUS_NAME;
		const hasPreviousNamesClass = $item.classList.contains(CssClass.SHOW_PREVIOUS_NAMES);

		if (previousNameMatch !== hasPreviousNamesClass) {
			if (hasPreviousNamesClass) {
				$item.classList.remove(CssClass.SHOW_PREVIOUS_NAMES);
			} else {
				$item.classList.add(CssClass.SHOW_PREVIOUS_NAMES);
			}
		}
	}

	return $matchedItems;
}

/**
 * Hide or show an item based on a `SearchQuery`
 */
function applySearchToItem(query: SearchQuery, $item: HTMLElement): MatchResult {
	const isStub = $item.getAttribute(DataAttribute.STUB) === 'true';

	if (isStub && !query.includeStubs) {
		return MatchResult.NO_MATCH;
	}

	const nameMatch = applySearchToItemName(query, $item);
	const typeMatch = applySearchToItemType(query, $item);

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
function applySearchToItemName(query: SearchQuery, $item: HTMLElement): MatchResult {
	const { name } = query;

	if (name === '') {
		return MatchResult.EMPTY_QUERY;
	} else {
		const itemNames = getItemNames($item);

		for (const [i, itemName] of itemNames.entries()) {
			if (typeof itemName === 'string') {
				const match = matchQueryToName(name, itemName);
				if (match) {
					if (i === 0) {
						return MatchResult.CURRENT_NAME;
					} else {
						return MatchResult.PREVIOUS_NAME;
					}
				}
			}
		}

		return MatchResult.NO_MATCH;
	}
}

/**
 * Retrieve an array of a search item's current name and previous names it has.
 */
function getItemNames($item: HTMLElement): string[] {
	const nameAttr = $item.getAttribute(DataAttribute.NAME);
	if (nameAttr === null) {
		console.error(`ERROR: Search item has no name`);
		console.error($item);
		throw new TypeError();
	}

	const previousNamesAttr = $item.getAttribute(DataAttribute.PREVIOUS_NAMES);

	const previousNames: string[] = (() => {
		// Try to parse previous names from markup. If any part fails, return `[]`
		if (previousNamesAttr) {
			try {
				const parsedNames: unknown = JSON.parse(previousNamesAttr.replace(/&quot;/g, '"'));
				if (
					Array.isArray(parsedNames) &&
					parsedNames.every((el: unknown): el is string => typeof el === 'string')
				) {
					return parsedNames;
				} else {
					return [];
				}
			} catch (e) {
				return [];
			}
		} else {
			return [];
		}
	})();

	const names = [nameAttr, ...previousNames];

	return names;
}

/**
 * Determine if an item matches the type part of a query
 */
function applySearchToItemType(query: SearchQuery, $item: HTMLElement): MatchResult {
	const { type } = query;

	if (type === '') {
		return MatchResult.EMPTY_QUERY;
	} else {
		const itemType = getItemType($item);

		if (itemType === type) {
			return MatchResult.TYPE;
		} else {
			return MatchResult.NO_MATCH;
		}
	}
}

/**
 * Retrieve a search item's type
 */
function getItemType($item: HTMLElement): string | null {
	const typeAttr = $item.getAttribute(DataAttribute.TYPE);

	return typeAttr;
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
