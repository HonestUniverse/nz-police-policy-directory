/**
 * Convert a string into a typable URL segment
 * For example, 'Kōkako Café's new coffee (strong)' becomes 'kookako-cafes-new-coffee-strong'
 */
export function toUrlSegment(str: string): string {
	let leadingDots = str.replace(/(^\.*).*/, '$1');

	let urlSegment = str.toLowerCase();

	// Replace macron characters with double vowel version
	// to keep them correct and also ensure they're easy
	// for anyone to type by hand
	urlSegment = urlSegment.replace(/ā/g, 'aa');
	urlSegment = urlSegment.replace(/ē/g, 'ee');
	urlSegment = urlSegment.replace(/ī/g, 'ii');
	urlSegment = urlSegment.replace(/ō/g, 'oo');
	urlSegment = urlSegment.replace(/ū/g, 'uu');

	// Strip accents
	urlSegment = stripAccents(urlSegment);

	// Remove apostrophes so they aren't replaced with '-'
	urlSegment = urlSegment.replace(/'/g, '');

	// Replace non-alphanumeric characters with '-' characters
	urlSegment = urlSegment.replace(/[^a-z0-9\/]+/g, '-');

	// Collapse multiple '-' characters
	urlSegment = urlSegment.replace(/-{2,}/g, '-');

	// Ensure it doesn't start or end with a '-'
	urlSegment = urlSegment.replace(/^-|-$/g, '');

	// Add any leading dots back
	urlSegment = leadingDots + urlSegment;

	return urlSegment;
}

/**
 * Converted accented characters such as āéôëŏüçñãáč to their non-accented base characters
 */
export function stripAccents(str: string): string {
	let normalisedStr = str.normalize('NFD');

	// Step through character by character and compare the original and normalised strings
	for (let i = 0; i < normalisedStr.length; i++) {
		const char = normalisedStr[i];

		// If they're the same, don't change anything
		if (char === str[i]) {
			continue;
		}

		// If the character is a letter, leave it alone
		if (/[a-z]/.test(char)) {
			continue;
		}

		// Otherwise, remove it and re-sync the strings for the next iteration
		let normalisedChars = normalisedStr.split('');
		normalisedChars.splice(i, 1);
		i -= 1;
		normalisedStr = normalisedChars.join('');
	}

	return normalisedStr;
}
