import { ColourScheme, isColourScheme } from './ColourScheme.js';
import { localStorageSupport } from '../utils/localStorageSupport.js';

import { waitFrame } from '../utils/waitFrame.js';

import { colourSchemeKey } from './key.js';
import { UtilCssClasses } from '../utils/UtilCssClasses.js';

/**
 * Update the `<body>` element to specify a preferred colour scheme.
 */
export async function applyColourScheme(scheme: ColourScheme, preventTransitions = true) {
	const $body = document.body;

	function apply() {
		$body.classList.remove(...Object.values(ColourScheme));
		if (scheme !== ColourScheme.DEFAULT) {
			$body.classList.add(scheme);
		}
	}

	if (preventTransitions) {
		$body.classList.add(UtilCssClasses.NO_TRANSITIONS);
		apply();

		// Preventing transitions requires a delay so transitions can be disabled while the colour scheme is applied
		await waitFrame();

		$body.classList.remove(UtilCssClasses.NO_TRANSITIONS);
	} else {
		apply();
	}
}

/**
 * Read a preferred colour scheme from `localStorage`, if one has been remembered.
 */
function recallColourScheme(): ColourScheme {
	if (localStorageSupport) {
		const scheme = localStorage.getItem(colourSchemeKey);

		if (isColourScheme(scheme)) {
			return scheme;
		} else {
			return ColourScheme.DEFAULT;
		}
	} else {
		return ColourScheme.DEFAULT;
	}
}

/**
 * Check for a remembered preferred colour scheme, and apply it if there is one.
 */
export function initColourScheme() {
	const scheme = recallColourScheme();
	applyColourScheme(scheme, false);
}
