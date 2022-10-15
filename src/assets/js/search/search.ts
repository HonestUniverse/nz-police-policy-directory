import { debounce } from '../utils/debounce.js';

import {
	SearchQuery,

	getSearchQueryFromFormData,
	getUrlParamsFromSearchQuery,
	compareSearchQuery,
} from './SearchQuery.js';

import { applySearch } from './applySearch.js';

enum Selector {
	FORM = '.js-search',
	INPUT = '.js-search__input',
	ITEM = '.js-search__item',
	NO_RESULTS = '.js-search__no-results',
}

/** The delay between the user stopping typing and the auto-search happening */
const inputDelay = 200;

/** The last `SearchQuery` that was executed */
let lastSearchQuery: SearchQuery | null = null;

function init() {
	initEvents();

	performSearchFromQueryString();
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
		if ($input instanceof HTMLInputElement || $input instanceof HTMLSelectElement || $input instanceof HTMLTextAreaElement) {
			$input.addEventListener('input', debouncedHandleSearchInputEvent);
			$input.addEventListener('change', handleSearchInputEvent);
		}
	});
}

/**
 * Apply a search query based on the current query string
 */
function performSearchFromQueryString() {
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
	performSearch($form);
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
 * Perform a search with a given form and show the results
 */
function performSearch($form: HTMLFormElement) {
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
	const $results = applySearch($items, searchQuery);

	const $noResultsArea = $target.querySelector<HTMLElement>(Selector.NO_RESULTS);
	if ($noResultsArea) {
		if ($results.length) {
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
	// Update the URL to match the `SearchQuery`
	const params = getUrlParamsFromSearchQuery(searchQuery);
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
