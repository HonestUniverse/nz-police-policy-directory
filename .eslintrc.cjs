module.exports = {
	root: true,
	env: {
		browser: true,
		es2021: true,
		node: false,
	},
	extends: [
		'eslint:recommended',
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	rules: {
		/////////////////////////
		// Overriding defaults //
		/////////////////////////

		// Sometimes it's useful to leave a name for an unused argument,
		// in case it might be used in the future
		'no-unused-vars': [
			'error',
			{
				'vars': 'all',
				'args': 'none',
				'destructuredArrayIgnorePattern': '.',
				'ignoreRestSiblings': false,
			},
		],

		// There are legitimate uses for empty functions
		'no-empty-function': 'off',

		////////////////////////
		// Debugging warnings //
		////////////////////////
		'no-debugger': 'warn',
		'no-constant-condition': 'warn',
		'no-warning-comments': [
			'warn',
			{
				'terms': ['TODO'],
				'location': 'start',
			},
		],

		////////////////
		// Code style //
		////////////////
		'array-bracket-spacing': ['error', 'never'],
		'arrow-parens': ['error', 'always'],
		'arrow-spacing': [
			'error', {
				'before': true,
				'after': true,
			},
		],
		'block-spacing': ['error', 'always'],
		'brace-style': [
			'error',
			'1tbs',
			{
				'allowSingleLine': true,
			},
		],
		'comma-dangle': [
			'error',
			{
				'arrays': 'always-multiline',
				'objects': 'always-multiline',
				'imports': 'always-multiline',
				'exports': 'always-multiline',
				'functions': 'only-multiline',
			},
		],
		'comma-spacing': [
			'error',
			{
				'before': false,
				'after': true,
			},
		],
		'comma-style': ['error', 'last'],
		'curly': ['error', 'all'],
		'default-case-last': 'error',
		'eol-last': ['error', 'always'],
		'func-call-spacing': ['error', 'never'],
		'indent': [
			'error',
			'tab',
			{
				'SwitchCase': 1,
				'ignoredNodes': [
					// Ignore indentation within template literals to allow them to be indented like markup
					'TemplateLiteral *',
				],
			},
		],
		'no-trailing-spaces': ['error'],
		'no-undefined': 'error',
		'no-var': 'error',
		'one-var': ['error', 'never'],
		'prefer-template': 'error',
		'quotes': [
			'error',
			'single',
			{
				'allowTemplateLiterals': true,
			},
		],
		'rest-spread-spacing': ['error', 'never'],
		'semi': ['error', 'always'],
		'semi-spacing': [
			'error',
			{
				'before': false,
				'after': true,
			},
		],
		'semi-style': ['error', 'last'],
		'space-before-blocks': ['error', 'always'],
		'space-before-function-paren': [
			'error',
			{
				anonymous: 'always',
				named: 'never',
				asyncArrow: 'always',
			},
		],
		'space-in-parens': ['error', 'never'],
		'space-unary-ops': [
			'error', {
				'words': true,
			},
		],
		'spaced-comment': [
			'error',
			'always',
			{
				'exceptions': ['/'],
				'block': {
					'balanced': true,
				}
			},
		],
		'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
	},
	overrides: [
		{
			files: ['**/*.ts'],
			extends: [
				'plugin:@typescript-eslint/recommended',
				'plugin:@typescript-eslint/recommended-requiring-type-checking',
			],
			parser: '@typescript-eslint/parser',
			parserOptions: {
				project: [
					'./tsconfig.json',
					'./build/tsconfig.json',
				],
			},
			plugins: ['@typescript-eslint'],
			rules: {
				/////////////////////////
				// Overriding defaults //
				/////////////////////////

				// Sometimes it's useful to leave a name for an unused argument,
				// in case it might be used in the future
				'@typescript-eslint/no-unused-vars': [
					'error',
					{
						'vars': 'all',
						'args': 'none',
						'destructuredArrayIgnorePattern': '.',
						'ignoreRestSiblings': false,
					},
				],

				// Sometimes it's useful to use a clearer name than `this`
				'@typescript-eslint/no-this-alias': 'off',

				// There can be value in being explicit about a type that could be inferred,
				// especially if a variable's default value might change in the future
				'@typescript-eslint/no-inferrable-types': 'off',

				// A function returning a `Promise<void>` should be able to go unchecked just
				// like a function that returns `void`
				'@typescript-eslint/no-misused-promises': [
					'error',
					{
						'checksVoidReturn': false,
					},
				],

				// I like being able to use `'' + val` to coerce an unknown type to a string
				'@typescript-eslint/restrict-plus-operands': 'off',

				// I don't mind type coercion in string literal expressions
				'@typescript-eslint/restrict-template-expressions': 'off',

				// There are legitimate uses for empty functions
				'@typescript-eslint/no-empty-function': 'off',

				// Using `any[]` for rest arguments can sometimes be necessary
				'@typescript-eslint/no-explicit-any': [
					'warn',
					{
						'ignoreRestArgs': true,
					},
				],

				// There are plenty of times where it's safe to use a Promise without error handling
				'@typescript-eslint/no-floating-promises': 'off',

				////////////////
				// Code style //
				////////////////
				'comma-dangle': 'off',
				'@typescript-eslint/comma-dangle': [
					'error',
					{
						'arrays': 'always-multiline',
						'objects': 'always-multiline',
						'imports': 'always-multiline',
						'exports': 'always-multiline',
						'functions': 'only-multiline',

						'enums': 'always-multiline',
						'generics': 'always-multiline',
						'tuples': 'always-multiline',
					}
				],

				'@typescript-eslint/consistent-type-assertions': [
					'error',
					{
						'assertionStyle': 'as',
					},
				],

				'space-before-function-paren': 'off',
				'@typescript-eslint/space-before-function-paren': [
					'error',
					{
						'anonymous': 'always',
						'named': 'never',
						'asyncArrow': 'always',
					},
				],
			},
		},
		{
			files: ['src/assets/**/*.ts'],
			env: {
				browser: true,
				es2021: true,
				node: false,
			},
			rules: {
				////////////////////////
				// Debugging warnings //
				////////////////////////
				'no-console': [
					'warn', {
						'allow': [
							'warn',
							'error',
						],
					},
				],
			},
		},
		{
			files: ['build/**/*.ts'],
			env: {
				browser: false,
				es2021: true,
				node: true,
			},
		}
	],
};
