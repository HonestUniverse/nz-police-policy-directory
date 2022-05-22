import { stripAccents } from '../../../../build/util/to-url-segment.js';
import { debounce } from '../utils/debounce.js';

enum Selectors {
	FORM = '.js-search',
	INPUT = '.js-search__input',
	ITEM = '.js-search__item',
	WRAPPER = '.js-search__item-wrapper',
}

enum DataAttribute {
	NAME = 'data-search-name',
}

/** The delay between the user stopping typing and the auto-search happening */
const inputDelay = 200;

function init() {
	initEvents();
}

/**
 * Bind all necessary event listeners
 */
function initEvents() {
	const $forms = document.querySelectorAll(Selectors.FORM);
	$forms.forEach(($form) => {
		if ($form instanceof HTMLFormElement) {
			$form.addEventListener('submit', handleSearchSubmitEvent);
		}
	});

	const $inputs = document.querySelectorAll(Selectors.INPUT);
	$inputs.forEach(($input) => {
		if ($input instanceof HTMLInputElement) {
			$input.addEventListener('input', debounce(handleSearchInputEvent, inputDelay));
		}
	});
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
 * Handle the search input's input event by performing a search
 */
function handleSearchInputEvent(this: HTMLInputElement, e: Event) {
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
	const targetId = $form.getAttribute('aria-controls');
	if (!targetId) {
		return;
	}

	const $target = document.getElementById(targetId);
	if (!$target) {
		return;
	}

	const data = new FormData($form);
	const query = data.get('q');
	if (typeof query !== 'string') {
		return;
	}

	applySearch($target, query);
}

/**
 * Apply a search query to a target area containing searchable items
 */
function applySearch($target: HTMLElement, query: string) {

	const $items = Array.from($target.querySelectorAll<HTMLElement>(Selectors.ITEM));
	const searchFn = applySearchToItem(query);

	// Filter items by query
	const $itemsToShow = $items.filter(searchFn);

	// Then update the `hidden` state of each item
	for (const $item of $items) {
		const $wrapper = $item.closest<HTMLElement>(Selectors.WRAPPER) || $item;
		const shouldShow = $itemsToShow.includes($item);

		if (shouldShow === $wrapper.hidden) {
			$wrapper.hidden = !shouldShow;
		}
	}
}

/**
 * Hide or show an item based on a search query
 */
function applySearchToItem(query: string) {
	return ($item: HTMLElement): boolean => {
		if (query === '') {
			return true;
		}

		const name = $item.getAttribute(DataAttribute.NAME);

		if (typeof name === 'string') {
			const match = matchQueryToName(query, name);
			return match;
		}

		return false;
	};
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
	// Remove all characters that aren't letters or spaces
	normalisedStr = normalisedStr.replace(/[^a-z ]/g, '');

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
