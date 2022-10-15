import { stripAccents } from '../../../../build/util/to-url-segment.js';
import { debounce } from '../utils/debounce.js';

enum Selector {
	FORM = '.js-search',
	INPUT = '.js-search__input',
	ITEM = '.js-search__item',
	WRAPPER = '.js-search__item-wrapper',
	NO_RESULTS = '.js-search__no-results',
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

enum InputName {
	NAME = 'name',
	TYPE = 'type',
	INCLUDE_STUBS = 'include-stubs',
}

enum MatchResult {
	NO_MATCH,
	EMPTY_QUERY,
	TYPE,
	CURRENT_NAME,
	PREVIOUS_NAME,
}

interface SearchQuery {
	name: string;
	type: string;
	includeStubs: boolean;
}

/** The delay between the user stopping typing and the auto-search happening */
const inputDelay = 200;

function init() {
	initEvents();

	applySearchFromQueryString();
}

/**
 * Bind all necessary event listeners
 */
function initEvents() {
	const $forms = document.querySelectorAll(Selector.FORM);
	$forms.forEach(($form) => {
		if ($form instanceof HTMLFormElement) {
			$form.addEventListener('submit', handleSearchSubmitEvent);
		}
	});

	const debouncedHandleSearchInputEvent = debounce(handleSearchInputEvent, inputDelay);
	const $inputs = document.querySelectorAll(Selector.INPUT);
	$inputs.forEach(($input) => {
		if ($input instanceof HTMLInputElement || $input instanceof HTMLSelectElement) {
			$input.addEventListener('input', debouncedHandleSearchInputEvent);
			$input.addEventListener('change', handleSearchInputEvent);
		}
	});
}

/**
 * Apply a search query based on the current query string
 */
function applySearchFromQueryString() {
	if (!window.location.search) {
		return;
	}

	const $form = document.querySelector<HTMLFormElement>(Selector.FORM);
	if (!$form) {
		return;
	}

	const $target = getSearchFormResultsElement($form);
	if (!$target) {
		return;
	}

	const params = new URLSearchParams(window.location.search);

	applyQueryStringToForm($form, params);

	const query = getSearchQueryFromUrlParams(params);
	applySearch($target, query);
}

/**
 * Apply the values from a query string to an HTML form
 */
function applyQueryStringToForm($form: HTMLFormElement, queryString: URLSearchParams): void {
	const $textareas = Array.from($form.querySelectorAll('textarea'));
	const $selects = Array.from($form.querySelectorAll('select'));
	const $inputs = Array.from($form.querySelectorAll('input'));

	const $fields = [
		...$textareas,
		...$selects,
		...$inputs,
	];

	for (const $field of $fields) {
		const name = $field.name;
		const value = queryString.get(name);

		if (value !== null) {
			$field.value = value;
		} else {
			$field.value = '';
		}
	}
}

/**
 * Build a `SearchQuery` based on a set of `URLSearchParams`
 */
function getSearchQueryFromUrlParams(params: URLSearchParams): SearchQuery {
	const name = params.get(InputName.NAME) ?? '';
	const type = params.get(InputName.TYPE) ?? '';
	const includeStubs = params.get(InputName.INCLUDE_STUBS) === String(true);

	const query: SearchQuery = {
		name,
		type,
		includeStubs,
	};

	return query;
}

/**
 * Build a `SearchQuery` based on a `FormData` object
 */
function getSearchQueryFromFormData(data: FormData): SearchQuery | null {
	const name = data.get(InputName.NAME);
	const type = data.get(InputName.TYPE);
	const includeStubs = data.get(InputName.INCLUDE_STUBS) === String(true);

	if (typeof name !== 'string' || typeof type !== 'string') {
		return null;
	}

	const searchQuery: SearchQuery = {
		name,
		type,
		includeStubs,
	};

	return searchQuery;
}

/**
 * Build a set of `URLSearchParams` based on a `SearchQuery`
 */
function getUrlParamsFromSearchQuery(query: SearchQuery): URLSearchParams {
	const {
		name,
		type,
		includeStubs,
	} = query;

	const params = new URLSearchParams();

	if (name) {
		params.set(InputName.NAME, name);
	}

	if (type) {
		params.set(InputName.TYPE, type);
	}

	params.set(InputName.INCLUDE_STUBS, String(includeStubs));

	return params;
}

/**
 * Retrieve the `HTMLElement` where a search form's results are displayed, if it can be found.
 */
function getSearchFormResultsElement($form: HTMLElement) {
	const targetId = $form.getAttribute('aria-controls');
	if (!targetId) {
		return null;
	}

	const $target = document.getElementById(targetId);
	return $target;
}

/**
 * Handle the search form's submit event by performing a search
 */
function handleSearchSubmitEvent(this: HTMLFormElement, e: SubmitEvent) {
	e.preventDefault();
	const $form = this;

	performSearch($form);
}

/**
 * Handle a search input's input or change event by performing a search
 */
function handleSearchInputEvent(this: HTMLInputElement | HTMLSelectElement, e: Event) {
	const $input = this;
	const $form = $input.form;

	if ($form) {
		performSearch($form);
	}
}

/**
 * Perform a search with a given form
 */
function performSearch($form: HTMLFormElement) {
	const $target = getSearchFormResultsElement($form);
	if (!$target) {
		return;
	}

	const data = new FormData($form);
	const searchQuery = getSearchQueryFromFormData(data);
	if (!searchQuery) {
		return;
	}

	const $results = applySearch($target, searchQuery);

	const $noResultsArea = $target.querySelector<HTMLElement>(Selector.NO_RESULTS);
	if ($noResultsArea) {
		if ($results.length) {
			$noResultsArea.hidden = true;
		} else {
			$noResultsArea.hidden = false;
		}
	}

	// Update the URL to match the `SearchQuery`
	const params = getUrlParamsFromSearchQuery(searchQuery);
	const paramString = `?${params.toString()}`;

	window.history.replaceState(null, '', paramString);
}

/**
 * Apply a `SearchQuery` to a target area containing searchable items
 */
function applySearch($target: HTMLElement, query: SearchQuery) {
	const $items = Array.from($target.querySelectorAll<HTMLElement>(Selector.ITEM));
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

// Self-initialise
init();
