// This component is split across several modules to allow the initialisation
// code to be minimal, so it can run as the page loads with minimal blocking.

import { ColourScheme } from './ColourScheme.js';
import { applyColourScheme } from './init-colour-scheme.js';
import { rememberColourScheme } from './remember-colour-scheme.js';

enum Selectors {
	TOGGLE = '.js-colour-scheme__toggle',
}

function init() {
	initEvents();
}

function initEvents() {
	const $toggles = document.querySelectorAll(Selectors.TOGGLE);

	$toggles.forEach(($toggle) => {
		$toggle.addEventListener('click', toggleColourScheme);
	});
}

/**
 * Get the currently applied colour scheme by checking the `<body>` class.
 * If none is explicitly applied, use `prefers-color-scheme` to determine it.
 */
function getColourScheme(): ColourScheme {
	const $body = document.querySelector('body');

	if ($body) {
		if ($body.classList.contains(ColourScheme.DARK)) {
			return ColourScheme.DARK;
		} else if ($body.classList.contains(ColourScheme.LIGHT)) {
			return ColourScheme.LIGHT;
		}
	}

	if (matchMedia('(prefers-color-scheme: dark)').matches) {
		return ColourScheme.DARK;
	} else {
		return ColourScheme.LIGHT;
	}
}

/**
 * Apply the complementary colour scheme to whatever is currently applied,
 * and remember the new preferred colour scheme.
 */
function toggleColourScheme() {
	const currentScheme = getColourScheme();
	const newScheme = currentScheme === ColourScheme.LIGHT ? ColourScheme.DARK : ColourScheme.LIGHT;

	applyColourScheme(newScheme);
	rememberColourScheme(newScheme);
}

// Self-initialise
init();
