import { ColourScheme } from './ColourScheme.js';
import { localStorageSupport } from '../utils/localStorageSupport.js';

import { colourSchemeKey } from './key.js';

/**
 * Use `localStorage`, if supported, to remember a preferred colour scheme.
 */
export function rememberColourScheme(scheme: ColourScheme) {
	if (localStorageSupport) {
		localStorage.setItem(colourSchemeKey, scheme);
	}
}
