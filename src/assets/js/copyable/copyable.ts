import { toast } from '../toast/toast.js';

enum Selector {
	WRAPPER = '.js-copyable',
	BUTTON = '.js-copyable__button',
	CONTENT = '.js-copyable__content',
}

function init() {
	initEvents();
}

/**
 * Bind all necessary event listeners
 */
function initEvents() {
	const $buttons = document.querySelectorAll<HTMLElement>(Selector.BUTTON);
	$buttons.forEach(($button) => {
		$button.addEventListener('click', copyEvent);
	});
};

function copyEvent(this: HTMLElement, e: MouseEvent) {
	const $button = this;
	const $wrapper = $button.closest(Selector.WRAPPER);
	const $content = $wrapper?.querySelector<HTMLElement>(Selector.CONTENT);

	if ($content) {
		copy($content);

		toast('Copied!');
	}
};

/**
 * Copy the text content of an element to the clipboard
 */
async function copy($element: HTMLElement): Promise<void> {
	if (navigator.clipboard) {
		const content = $element.innerText;
		const contentBlob = new Blob([content], { type: 'text/plain' });
		const contentItem = new ClipboardItem({ 'text/plain': contentBlob });
		await navigator.clipboard.write([contentItem]);
	} else {
		const range = document.createRange();
		range.selectNode($element);

		const selection = window.getSelection();
		if (!selection) {
			// This can only happen in weird circumstances, should never show up in practice
			return;
		}

		selection.removeAllRanges();
		selection.addRange(range);

		document.execCommand('copy');

		selection.removeAllRanges();
	}
}

init();
