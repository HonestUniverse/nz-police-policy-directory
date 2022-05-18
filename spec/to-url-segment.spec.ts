import { toUrlSegment } from '../build/util/to-url-segment.js';

const testExpectations = (expectations: Iterable<[string, string]>) => () => {
	for (const [before, after] of expectations) {
		expect(toUrlSegment(before)).toBe(after);
	}
};

describe('toUrlSegment', () => {
	it(`leaves a valid url segment unchanged`, testExpectations([
		['test', 'test'],
		['unnamed-version-1', 'unnamed-version-1'],
		['version-18-0', 'version-18-0'],
		['123ee123', '123ee123'],
		['123ee123', '123ee123'],
	]));

	it(`ignores one or more '.' characters at the beginning`, testExpectations([
		['../build-utils/', '../build-utils/'],
	]));

	it(`ignores '/' characters`, testExpectations([
		['../build-utils/', '../build-utils/'],
	]));

	it(`converts strings to lowercase`, testExpectations([
		['TEST', 'test'],
		['Unnamed Version 1', 'unnamed-version-1'],
		['Version 18.0', 'version-18-0'],
		['123Ee123', '123ee123'],
	]));

	it(`converts vowels with macrons into double vowels`, testExpectations([
		['Māori', 'maaori'],
		['Kōkako', 'kookako'],
		['Pākehā', 'paakehaa'],
	]));

	it(`removes non-macron accents from letters`, testExpectations([
		['Café', 'cafe'],
		['née', 'nee'],
		['entrepôt', 'entrepot'],
		['Zoë', 'zoe'],
		['drŏll', 'droll'],
		['über', 'uber'],
		['soupçon', 'soupcon'],
		['Señor', 'senor'],
		['João', 'joao'],
		['háček', 'hacek'],
	]));

	it(`removes apostrophes`, testExpectations([
		['this\'s weird', 'thiss-weird'],
	]));

	it(`converts remaining non-alphanumeric characters into a '-'`, testExpectations([
		['this string has spaces (and brackets), see?', 'this-string-has-spaces-and-brackets-see']
	]));

	it(`collapses consecutive '-' characters into one`, testExpectations([
		['this string     has spaces ((and brackets):;, see?', 'this-string-has-spaces-and-brackets-see']
	]));

	it(`removes leading or trailing '-' characters`, testExpectations([
		['___this string has spaces (and brackets), see???', 'this-string-has-spaces-and-brackets-see']
	]));
});
