module.exports = {
	extends: 'stylelint-config-recommended-scss',
	rules: {
		/////////////////////////
		// Overriding defaults //
		/////////////////////////

		// I like laying out empty blocks to make it clear
		// what other elements exist for a component. Empty
		// blocks are removed when SCSS is compiled anyway.
		'block-no-empty': null,

		// If custom elements are used, there should be no
		// problem with styling them.
		'selector-type-no-unknown': [
			true,
			{
				ignore: ['custom-elements'],
			},
		],

		// Empty comments can be useful for spacing and formatting
		'scss/comment-no-empty': null,

		// Duplicate selectors can be useful for nesting different children
		// in ways that are easier to follow
		'no-duplicate-selectors': null,

		// No descending specificity is useful when deeply nested selectors are
		// used, but well-written SCSS should not run into these being an issue
		'no-descending-specificity': null,

		////////////////////////
		// Debugging warnings //
		////////////////////////
		'comment-word-disallowed-list': [
			['/^TODO/'],
			{
				severity: 'warning',
			},
		],

		//////////////////////
		// Coding standards //
		//////////////////////

		// If a selector includes an ID, a second ID should not be necessary
		'selector-max-id': 1,

		// Type selectors should be avoided wherever possible, but there are
		// some rare occasions where two are needed
		'selector-max-type': 2,

		////////////////
		// Code style //
		////////////////

		// BEM style. All lowercase letters or numbers with separators of - or -- or __
		// Cannot start with a number
		'selector-class-pattern': '^[a-z][a-z0-9]*((-{1,2}|__)[a-z0-9]+)*$',

		// All lowercase letters or numbers with separators of -
		// Cannot start with a number
		'selector-id-pattern': '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',

		// camelCase
		'keyframes-name-pattern': '^[a-z]+([A-Z][a-z]+)*$',

		'selector-pseudo-element-colon-notation': 'double',

		'no-irregular-whitespace': true,

		'font-family-name-quotes': 'always-unless-keyword',

		// These code style rules are frozen in `Stylelint`
		///////////////////////////////////////////////////

		'value-keyword-case': [
			'lower',
			{
				camelCaseSvgKeywords: true,
			},
		],

		'function-name-case': 'lower',

		'selector-type-case': 'lower',

		'comment-whitespace-inside': 'always',

		'color-hex-case': 'lower',

		'function-comma-space-before': 'never',
		'function-comma-space-after': 'always-single-line',
		'function-comma-newline-before': 'never-multi-line',
		'function-comma-newline-after': 'always-multi-line',

		'function-parentheses-newline-inside': 'always-multi-line',
		'function-parentheses-space-inside': 'never',
		'function-whitespace-after': 'always',

		'number-leading-zero': 'always',

		'string-quotes': 'double',

		'value-list-comma-space-before': 'never',
		'value-list-comma-space-after': 'always-single-line',
		'value-list-comma-newline-before': 'never-multi-line',
		'value-list-comma-newline-after': 'always-multi-line',

		'declaration-bang-space-before': 'always',
		'declaration-bang-space-after': 'never',

		'declaration-colon-newline-after': 'always-multi-line',
		'declaration-colon-space-before': 'never',
		'declaration-colon-space-after': 'always-single-line',

		'declaration-block-semicolon-newline-after': 'always-multi-line',
		'declaration-block-semicolon-newline-before': 'never-multi-line',
		'declaration-block-semicolon-space-after': 'always-single-line',
		'declaration-block-semicolon-space-before': 'never',
		'declaration-block-trailing-semicolon': 'always',

		'block-closing-brace-empty-line-before': 'never',
		'block-closing-brace-newline-after': [
			'always',
			{
				ignoreAtRules: ['if', 'else'],
			},
		],
		'scss/at-else-closing-brace-newline-after': 'always-last-in-chain',
		'block-closing-brace-space-before': 'always-single-line',

		'block-opening-brace-newline-after': 'always-multi-line',
		'block-opening-brace-space-after': 'always-single-line',
		'block-opening-brace-space-before': 'always',

		'selector-attribute-brackets-space-inside': 'never',
		'selector-attribute-operator-space-after': 'never',
		'selector-attribute-operator-space-before': 'never',

		'selector-combinator-space-after': 'always',
		'selector-combinator-space-before': 'always',
		'selector-descendant-combinator-no-non-space': true,
		'selector-max-empty-lines': 0,

		'selector-pseudo-class-case': 'lower',
		'selector-pseudo-class-parentheses-space-inside': 'never',
		'selector-pseudo-element-case': 'lower',

		'selector-list-comma-newline-after': 'always-multi-line',
		'selector-list-comma-newline-before': 'never-multi-line',
		'selector-list-comma-space-after': 'always-single-line',
		'selector-list-comma-space-before': 'never',

		'media-feature-colon-space-after': 'always',
		'media-feature-colon-space-before': 'never',
		'media-feature-name-case': 'lower',
		'media-feature-parentheses-space-inside': 'never',
		'media-feature-range-operator-space-after': 'always',
		'media-feature-range-operator-space-before': 'always',

		'media-query-list-comma-newline-after': 'always-multi-line',
		'media-query-list-comma-newline-before': 'never-multi-line',
		'media-query-list-comma-space-after': 'always-single-line',
		'media-query-list-comma-space-before': 'never',

		'at-rule-name-case': 'lower',
		'at-rule-name-space-after': 'always',
		'at-rule-semicolon-newline-after': 'always',
		'at-rule-semicolon-space-before': 'never',

		indentation: 'tab',

		'no-eol-whitespace': true,

		'no-extra-semicolons': true,

		'no-missing-end-of-source-newline': true,
	},
}
