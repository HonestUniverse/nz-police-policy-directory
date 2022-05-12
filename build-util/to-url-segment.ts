/**
 * Convert a string into a typable URL segment
 * For example, 'Kōkako Café's new coffee (strong)' becomes 'kookako-cafes-new-coffee-strong'
 */
export function toUrlSegment(str: string): string {
	let urlSegment = str.toLowerCase();

	// Replace macron characters with double vowel version
	// to keep them correct and also ensure they're easy
	// for anyone to type by hand
	urlSegment = urlSegment.replace(/ā/g, 'aa');
	urlSegment = urlSegment.replace(/ē/g, 'ee');
	urlSegment = urlSegment.replace(/ī/g, 'ii');
	urlSegment = urlSegment.replace(/ō/g, 'oo');
	urlSegment = urlSegment.replace(/ū/g, 'uu');

	// Strip accents etc.
	let normalisedSegment = urlSegment.normalize('NFD');
	for (let i = 0; i < normalisedSegment.length; i++) {
		const char = normalisedSegment[i];

		// If it's the same, don't change anything
		if (char === urlSegment[i]) {
			continue;
		}

		// If it's a letter, leave it alone
		if (/[a-z]/.test(char)) {
			continue;
		}

		// Otherwise, remove it
		let normalisedChars = normalisedSegment.split('');
		normalisedChars.splice(i, 1);
		i -= 1;
		normalisedSegment = normalisedChars.join('');
	}
	urlSegment = normalisedSegment;

	// Replace non-letters with '-' characters
	urlSegment = urlSegment.replace(/[^a-z]+/g, '-');

	// Collapse multiple '-' characters
	urlSegment = urlSegment.replace(/-{2,}/g, '-');

	return urlSegment;
}
