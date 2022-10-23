import { debounce } from '../utils/debounce.js';

import {
	SearchIndex,
	isSearchIndex,
} from '../../../shared/SearchIndex.js';

import {
	SearchQuery,

	getSearchQueryFromFormData,
	getUrlParamsFromSearchQuery,
	compareSearchQuery,
	SearchQueryParam,
} from './SearchQuery.js';

import { applySearch } from './applySearch.js';

import { MatchResult } from './applySearch.js';

enum Selector {
	FORM = '.js-search',
	INPUT = '.js-search__input',
	WRAPPER = '.js-search__item-wrapper',
	ITEM = '.js-search__item',
	NO_RESULTS = '.js-search__no-results',
}

enum DataAttribute {
	key = 'data-search-key',
}

enum CssClass {
	SHOW_PREVIOUS_NAMES = 'show-previous-names',
}

/** The delay between the user stopping typing and the auto-search happening */
const inputDelay = 200;

/** The last `SearchQuery` that was executed */
let lastSearchQuery: SearchQuery | null = null;

async function init() {
	const $form = document.querySelector<HTMLFormElement>(Selector.FORM);
	if (!$form) {
		return;
	}
	const params = new URLSearchParams(window.location.search);
	applyQueryStringToForm($form, params);

	try {
		const indexResponse = await fetch('/search.json');
		const index = await indexResponse.json() as unknown;

		if (!isSearchIndex(index)) {
			return;
		}

		initEvents(index);

		performSearch($form, index);
	} catch (e: unknown) {
		// If we can't load the search index, don't do anything
	}
}

/**
 * Bind all necessary event listeners
 */
function initEvents(index: SearchIndex) {
	const $forms = document.querySelectorAll(Selector.FORM);
	$forms.forEach(($form) => {
		if ($form instanceof HTMLFormElement) {
			$form.addEventListener('submit', createSubmitHandler(index));
		}
	});

	const inputHandler = createInputHandler(index);
	const debouncedInputHandler = debounce(inputHandler, inputDelay);

	const $inputs = document.querySelectorAll(Selector.INPUT);
	$inputs.forEach(($input) => {
		if (
			$input instanceof HTMLInputElement ||
			$input instanceof HTMLSelectElement ||
			$input instanceof HTMLTextAreaElement
		) {
			$input.addEventListener('input', debouncedInputHandler);
			$input.addEventListener('change', inputHandler);
		}
	});
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

		if ($field instanceof HTMLInputElement && $field.type === 'checkbox') {
			// Only set the value of a checkbox if it was recorded as a boolean,
			// otherwise let the input keep its default value
			if (value === String(false)) {
				$field.checked = false;
			} else if (value === String(true)) {
				$field.checked = true;
			}
		} else {
			// Update the value of a field if it was recorded, otherwise let the
			// field keep its default value
			if (value !== null) {
				$field.value = value;
			}
		}
	}
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
 * Create a submit event handler based on a `SearchIndex`
 */
function createSubmitHandler(index: SearchIndex) {
	/**
	 * Handle the search form's submit event by performing a search
	 */
	return function handleSearchSubmit(this: HTMLFormElement, e: SubmitEvent) {
		e.preventDefault();
		const $form = this;

		performSearch($form, index);
	};
}

/**
 * Create an input event handler based on a `SearchIndex`
 */
function createInputHandler(index: SearchIndex) {
	/**
	 * Handle a search input's input or change event by performing a search
	 */
	return function handleSearchInput(this: HTMLInputElement | HTMLSelectElement, e: Event) {
		const $input = this;
		const $form = $input.form;

		if ($form) {
			performSearch($form, index);
		}
	};
}

/**
 * Perform a search with a given form and show the results
 */
function performSearch($form: HTMLFormElement, index: SearchIndex) {
	const $target = getSearchFormResultsElement($form);
	if (!$target) {
		return;
	}

	const data = new FormData($form);
	const searchQuery = getSearchQueryFromFormData(data);

	if (lastSearchQuery && compareSearchQuery(searchQuery, lastSearchQuery)) {
		// Don't re-apply a `SearchQuery` if it's the same as the last executed query
		return;
	} else {
		lastSearchQuery = searchQuery;
	}

	const $items = Array.from($target.querySelectorAll<HTMLElement>(Selector.ITEM));
	// const $results = applySearch($items, searchQuery);
	const results = applySearch(index, searchQuery);

	for (const [key, result] of results) {
		const $item = $items.find(($el) => $el.getAttribute(DataAttribute.key) === key);
		if (!$item) {
			// The item doesn't exist in the DOM, so we can't do anything with it
			continue;
		}

		const shouldShow = result.match !== MatchResult.NO_MATCH;

		const $wrapper = $item.closest<HTMLElement>(Selector.WRAPPER) || $item;

		if (shouldShow === $wrapper.hidden) {
			$wrapper.hidden = !shouldShow;
		}

		const previousNameMatch = result.match === MatchResult.PREVIOUS_NAME;
		const hasPreviousNamesClass = $item.classList.contains(CssClass.SHOW_PREVIOUS_NAMES);

		if (previousNameMatch !== hasPreviousNamesClass) {
			if (hasPreviousNamesClass) {
				$item.classList.remove(CssClass.SHOW_PREVIOUS_NAMES);
			} else {
				$item.classList.add(CssClass.SHOW_PREVIOUS_NAMES);
			}
		}

		// TODO: Reorder based on relevance
	}

	const $noResultsArea = $target.querySelector<HTMLElement>(Selector.NO_RESULTS);
	if ($noResultsArea) {
		if (results.some(([key, result]) => result.match !== MatchResult.NO_MATCH)) {
			$noResultsArea.hidden = true;
		} else {
			$noResultsArea.hidden = false;
		}
	}

	updateUrlToMatchSearchQuery(searchQuery);
}

/**
 * Update the current URL to reflect a given `SearchQuery`
 */
function updateUrlToMatchSearchQuery(searchQuery: SearchQuery): void {
	// Update any existing params to include the current search params
	const params = new URLSearchParams(document.location.search);
	const searchParams = getUrlParamsFromSearchQuery(searchQuery);

	for (const [key, val] of searchParams) {
		params.set(key, val);
	}

	for (const param of Object.values(SearchQueryParam)) {
		if (!searchParams.get(param)) {
			params.delete(param);
		}
	}

	const paramsString = params.toString();

	// Replacing the entire URL lets us remove the `?` if there are no query parameters
	const newUrl = new URL(document.location.toString());
	if (paramsString) {
		newUrl.search = paramsString;
	} else {
		newUrl.search = '';
	}

	window.history.replaceState(null, '', String(newUrl));
}

// Self-initialise
init();
