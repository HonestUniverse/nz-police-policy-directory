import * as webpack from 'webpack';

import dotenv from 'dotenv';
dotenv.config();

import resolveTypeScriptPluginModule from 'resolve-typescript-plugin';
const ResolveTypeScriptPlugin = resolveTypeScriptPluginModule;

import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import AlterPlugin from './build/util/alter-plugin.js';

import { createBuildPlugins } from './build/build.js';

import * as paths from './build/util/paths.js';

import { generateCacheBustingString } from './build/util/generateCacheBustingString.js';

enum Mode {
	DEVELOPMENT = 'development',
	PRODUCTION = 'production',
}

async function getConfig(env: Record<string, unknown>, argsv: Record<string, unknown>) {
	const mode = argsv.mode === Mode.DEVELOPMENT ? Mode.DEVELOPMENT : Mode.PRODUCTION;
	const cacheBustingString = mode === Mode.PRODUCTION ? `-${generateCacheBustingString()}` : '';

	const config: webpack.Configuration = {
		mode,
		entry: {
			main: `${paths.assetsFull}/js/main.ts`,
			enhancements: `${paths.assetsFull}/js/enhancements.ts`,
			priority: `${paths.assetsFull}/js/priority.ts`,

			style: `${paths.assetsFull}/js/style.ts`,
			'style-content': `${paths.assetsFull}/js/style-content.ts`,
			'style-directory': `${paths.assetsFull}/js/style-directory.ts`,
			'style-document': `${paths.assetsFull}/js/style-document.ts`,
		},
		output: {
			path: paths.distFull,
			filename: `assets/js/[name]${cacheBustingString}.js`,
			publicPath: '/',
		},
		resolve: {
			fullySpecified: true,
			plugins: [new ResolveTypeScriptPlugin()],
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					loader: 'ts-loader',
				},
				{
					test: /\.scss$/,
					use: [
						{
							loader: MiniCssExtractPlugin.loader,
							options: {
								esModule: false,
							},
						},
						{
							loader: 'css-loader',
							options: {
								url: false,
							},
						},
						'sass-loader',
					],
				},
			],
		},
		plugins: [
			new MiniCssExtractPlugin({
				filename: `assets/css/[name]${cacheBustingString}.css`,
				chunkFilename: `[id]${cacheBustingString}.css`,
				ignoreOrder: false,
			}),
			...await createBuildPlugins(env.test ? paths.testPolicies : paths.policies),
			new AlterPlugin({
				defer: ['main', 'enhancements'],
				body: ['priority'],
				preload: ['priority'],
				module: ['enhancements'],
				remove: [
					'style',
					'style-content',
					'style-directory',
					'style-document',
				],
			}),
		],
	};

	switch (mode) {
		case 'development':
			config.optimization = {
				minimize: false,
			};
			config.devtool = 'eval-source-map';
			break;
		case 'production':
		default:
			config.devtool = 'source-map';
			break;
	}

	return config;
};

export default getConfig;
