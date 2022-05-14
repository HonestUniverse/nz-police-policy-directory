import { ColourScheme, isColourScheme } from './ColourScheme.js';
import { localStorageSupport } from '../utils/localStorageSupport.js';

import { colourSchemeKey } from './key.js';

/**
 * Update the `<body>` element to specify a preferred colour scheme.
 */
export function applyColourScheme(scheme: ColourScheme) {
	const $body = document.body;

	$body.classList.remove(...Object.values(ColourScheme));
	if (scheme !== ColourScheme.DEFAULT) {
		$body.classList.add(scheme);
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
	applyColourScheme(scheme);
}
