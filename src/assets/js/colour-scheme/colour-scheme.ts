// This component is split across several modules to allow the initialisation
// code to be minimal, so it can run as the page loads with minimal blocking.

import { localStorageSupport } from '../utils/localStorageSupport.js';

import { colourSchemeKey } from './key.js';

import { ColourScheme, isColourScheme } from './ColourScheme.js';
import { applyColourScheme } from './init-colour-scheme.js';

enum Selectors {
	COLOUR_SCHEME = '.js-colour-scheme',
	FACE = '.js-colour-scheme__face',
	MENU = '.js-colour-scheme__menu',
	MENU_OPTION = '.js-colour-scheme__menu__option',
}

enum DataAttributes {
	VALUE = 'data-value',
}

enum MenuState {
	OPENED,
	CLOSED,
}

/**
 * This component follows the "menu" behaviour described in the
 * WAI-ARIA Authoring Practices 1.2 documentation:
 * https://www.w3.org/TR/wai-aria-practices-1.2/#menu
 */

let lastFocus: typeof document.activeElement = null;

function init() {
	syncState();

	initEvents();
}

/**
 * Bind all general event listeners
 */
function initEvents() {
	const $faces = document.querySelectorAll<HTMLElement>(Selectors.FACE);
	$faces.forEach(($face) => {
		$face.addEventListener('click', toggleMenuEvent);
	});

	const $menus = document.querySelectorAll<HTMLElement>(Selectors.MENU);
	$menus.forEach(($menu) => {
		$menu.addEventListener('keydown', menuKeyboardEvent);
	});

	const $options = document.querySelectorAll<HTMLElement>(Selectors.MENU_OPTION);
	$options.forEach(($option) => {
		$option.addEventListener('click', selectOptionEvent);
		$option.addEventListener('keydown', optionKeyboardEvent);
	});
}

/**
 * Toggle a menu between open and closed when its "face" button is clicked
 */
function toggleMenuEvent(this: HTMLElement, e: MouseEvent) {
	const $menu = getFaceTarget(this);

	if ($menu) {
		toggleMenu($menu);
	}
}

/**
 * Handle custom keyboard navigation within a menu
 */
function menuKeyboardEvent(this: HTMLElement, e: KeyboardEvent) {
	switch (e.key) {
		case 'ArrowDown':
			e.preventDefault();
			moveMenuItemFocus(this, +1);
			break;
		case 'ArrowUp':
			e.preventDefault();
			moveMenuItemFocus(this, -1);
			break;
	}
}

/**
 * Select an option when it is clicked
 */
function selectOptionEvent(this: HTMLElement, e: MouseEvent) {
	selectOption(this);
}

/**
 * Handle option selection on Enter and Spacebar keydown
 */
function optionKeyboardEvent(this: HTMLElement, e: KeyboardEvent) {
	switch (e.key) {
		case 'Enter':
			// Activate the current option, and close the menu
			selectOption(this);
			closeCurrentMenu();
			break;
		case ' ':
			// Activate the current option without closing the menu
			e.preventDefault();
			selectOption(this);
			break;
	}
}

/**
 * Set a menu to be opened or closed, and handle all necessary side effects
 */
function setMenuState($menu: HTMLElement, state: MenuState) {
	const $faces = getTargetingFaces($menu);

	switch (state) {
		case MenuState.OPENED:
			lastFocus = document.activeElement;

			$menu.setAttribute('aria-expanded', 'true');
			$faces.forEach(($face) => $face.setAttribute('aria-expanded', 'true'));

			// When opening the menu, focus should be placed on the first item
			const $firstOption = $menu.querySelector<HTMLElement>(Selectors.MENU_OPTION);
			if ($firstOption) {
				$firstOption.focus();
			}

			bindMenuOpenEvents($menu);
			break;
		case MenuState.CLOSED:
			$menu.removeAttribute('aria-expanded');
			$faces.forEach(($face) => $face.removeAttribute('aria-expanded'));

			setTimeout(() => {
				// When closing a menu, if no element has focus then
				// focus should be returned to the element that had focus before opening the menu
				if (!document.activeElement || document.activeElement === document.body) {
					if (lastFocus instanceof HTMLElement) {
						lastFocus.focus();
					}
				}

				lastFocus = null;
			});

			unbindMenuOpenEvents($menu);
			break;
	}
}

/**
 * Add event listeners used for closing a menu while it is open
 */
function bindMenuOpenEvents($menu: HTMLElement) {
	const $wrapper = $menu.closest<HTMLElement>(Selectors.COLOUR_SCHEME);

	document.addEventListener('keydown', closeMenuOnEscape);
	if ($wrapper) {
		$wrapper.addEventListener('focusout', closeMenuOnFocusOut);
	}
}

/**
 * Remove event listeners for closing a menu while it is open
 */
function unbindMenuOpenEvents($menu: HTMLElement) {
	const $wrapper = $menu.closest<HTMLElement>(Selectors.COLOUR_SCHEME);

	document.removeEventListener('keydown', closeMenuOnEscape);
	if ($wrapper) {
		$wrapper.removeEventListener('focusout', closeMenuOnFocusOut);
	}
}

/**
 * Get the target of a face button
 */
function getFaceTarget($face: HTMLElement): HTMLElement | null {
	const targetId = $face.getAttribute('aria-controls');
	if (targetId) {
		return document.getElementById(targetId);
	} else {
		return null;
	}
}

/**
 * Get all face buttons targeting a given menu
 */
function getTargetingFaces($menu: HTMLElement): HTMLElement[] {
	const $allFaces = document.querySelectorAll<HTMLElement>(Selectors.FACE);
	const id = $menu.getAttribute('id');
	/** Face buttons that control this menu */
	const $faces = Array.from($allFaces).filter(($face) => $face.getAttribute('aria-controls') === id);

	return $faces;
}

/**
 * Toggle a menu between opened and closed
 */
function toggleMenu($menu: HTMLElement) {
	const currentState = getMenuState($menu);
	const newState = getOpposingMenuState(currentState);
	setMenuState($menu, newState);
}

/**
 * Check if a menu is currently opened or closed
 */
function getMenuState($menu: HTMLElement): MenuState {
	const isOpen = $menu.getAttribute('aria-expanded') === 'true';

	return isOpen ? MenuState.OPENED : MenuState.CLOSED;
}

/**
 * Determine the opposite to a menu's current state, for toggling it
 */
function getOpposingMenuState(state: MenuState): MenuState {
	switch (state) {
		case MenuState.OPENED:
			return MenuState.CLOSED;
			break;
		case MenuState.CLOSED:
			return MenuState.OPENED;
			break;
	}
}

/**
 * Close the current menu if the "Escape" key was pressed
 */
function closeMenuOnEscape(this: Document, e: KeyboardEvent) {
	if (e.key === 'Escape') {
		closeCurrentMenu();
	}
}

/**
 * Close the current menu if focus has moved out of it
 */
function closeMenuOnFocusOut(this: HTMLElement, e: FocusEvent) {
	let shouldClose = true;

	window.setTimeout(() => {
		const $activeElement = document.activeElement;
		if ($activeElement) {
			const $wrapper = $activeElement.closest<HTMLElement>(Selectors.COLOUR_SCHEME);
			if ($wrapper) {
				const $menu = $wrapper.querySelector<HTMLElement>(Selectors.MENU);
				if ($menu && getMenuState($menu) === MenuState.OPENED) {
					// Focus is still inside an open menu, so do nothing
					shouldClose = false;
				}
			}
		}

		if (shouldClose) {
			closeCurrentMenu();
		}
	});
}

/**
 * Close the current menu
 */
function closeCurrentMenu() {
	const $menus = document.querySelectorAll<HTMLElement>(Selectors.MENU);
	$menus.forEach(($menu) => {
		if (getMenuState($menu) === MenuState.OPENED) {
			setMenuState($menu, MenuState.CLOSED);
		}
	});
}

/**
 * Select a given option, and apply all necessary side effects
 */
function selectOption($option: HTMLElement) {
	const scheme = $option.getAttribute(DataAttributes.VALUE);
	if (isColourScheme(scheme)) {
		syncState(scheme);
	}
}

/**
 * Move focus between items in a menu
 */
function moveMenuItemFocus($menu: HTMLElement, incr: number) {
	const $options = $menu.querySelectorAll<HTMLElement>(Selectors.MENU_OPTION);
	const currentOptionIndex = (Array.from($options) as unknown[]).indexOf(document.activeElement);

	if (currentOptionIndex === -1) {
		// Put focus on the first menu item
		$options[0].focus();
	} else {
		// Move focus to the next menu item
		let nextIndex = (currentOptionIndex + incr) % $options.length;
		while (nextIndex < 0) {
			nextIndex += $options.length;
		}
		if (currentOptionIndex !== nextIndex) {
			$options[nextIndex].focus();
		}
	}
}

/**
 * Apply a particular colour scheme, and update the UI to match it.
 *
 * If no scheme is specified, the currently active scheme is applied.
 */
function syncState(scheme?: ColourScheme) {
	const currentColourScheme = getColourScheme();

	if (!scheme) {
		scheme = currentColourScheme;
	} else if (scheme !== currentColourScheme) {
		applyColourScheme(scheme);
		rememberColourScheme(scheme);
	}

	const $options = document.querySelectorAll(Selectors.MENU_OPTION);
	$options.forEach(($option) => {
		const optionScheme = $option.getAttribute(DataAttributes.VALUE);
		if (optionScheme === scheme) {
			// Select
			$option.setAttribute('aria-checked', 'true');
		} else {
			// Unselect
			$option.setAttribute('aria-checked', 'false');
		}
	});
}

/**
 * Get the currently applied colour scheme by checking the `<body>` class.
 */
function getColourScheme(): ColourScheme {
	const $body = document.body;

	if ($body.classList.contains(ColourScheme.DARK)) {
		return ColourScheme.DARK;
	} else if ($body.classList.contains(ColourScheme.LIGHT)) {
		return ColourScheme.LIGHT;
	} else {
		return ColourScheme.DEFAULT;
	}
}

/**
 * Use `localStorage`, if supported, to remember a preferred colour scheme.
 */
 function rememberColourScheme(scheme: ColourScheme) {
	if (localStorageSupport) {
		if (scheme === ColourScheme.DEFAULT) {
			localStorage.removeItem(colourSchemeKey);
		} else {
			localStorage.setItem(colourSchemeKey, scheme);
		}
	}
}


// Self-initialise
init();
