import { stripAccents } from '../../../../build/util/to-url-segment.js';
import { debounce } from '../utils/debounce.js';

enum Selector {
	FORM = '.js-search',
	INPUT = '.js-search__input',
	ITEM = '.js-search__item',
	WRAPPER = '.js-search__item-wrapper',
}

enum DataAttribute {
	NAME = 'data-search-name',
	PREVIOUS_NAMES = 'data-search-previous-names',
}

enum CssClass {
	SHOW_PREVIOUS_NAMES = 'show-previous-names',
}

enum MatchResult {
	NO_MATCH,
	EMPTY_QUERY,
	CURRENT_NAME,
	PREVIOUS_NAME,
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
	const $forms = document.querySelectorAll(Selector.FORM);
	$forms.forEach(($form) => {
		if ($form instanceof HTMLFormElement) {
			$form.addEventListener('submit', handleSearchSubmitEvent);
		}
	});

	const $inputs = document.querySelectorAll(Selector.INPUT);
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

	const $items = Array.from($target.querySelectorAll<HTMLElement>(Selector.ITEM));

	for (const $item of $items) {
		const itemResult = applySearchToItem(query, $item);
		const shouldShow = itemResult !== MatchResult.NO_MATCH;

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
}

/**
 * Hide or show an item based on a search query
 */
function applySearchToItem(query: string, $item: HTMLElement): MatchResult {
	if (query === '') {
		return MatchResult.EMPTY_QUERY;
	}

	const names = getItemNames($item);

	for (const [i, name] of names.entries()) {
		if (typeof name === 'string') {
			const match = matchQueryToName(query, name);
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

/**
 * Search items have a current name and an optional list of previous names
 */
function getItemNames($item: HTMLElement) {
	const nameAttr = $item.getAttribute(DataAttribute.NAME);
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

	// const previousNames: string[] = previousNamesAttr ? JSON.parse(previousNamesAttr.replace(/&quot;/g, '"')) : [];

	const names = [nameAttr, ...(previousNames)];

	return names;
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
