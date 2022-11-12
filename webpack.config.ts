import * as webpack from 'webpack';

import dotenv from 'dotenv';
dotenv.config();

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
	const cacheBustingString = mode === Mode.PRODUCTION ? `.v-${generateCacheBustingString()}` : '';
	const optimization = mode === Mode.DEVELOPMENT ? { minimize: false } : {};
	const devtool = mode === Mode.DEVELOPMENT ? 'eval-source-map' : 'source-map';

	const baseConfig = {
		mode,
		optimization,
		devtool,

		resolve: {
			fullySpecified: true,
			extensionAlias: {
				'.js': ['.ts', '.js'],
			},
		},

		performance: {
			maxAssetSize: 20 * 1024 * 1024, // 25 MB - max file size on Cloudflare Pages
		},
	};

	const mainConfig: webpack.Configuration = Object.assign({}, baseConfig, {
		entry: {
			main: `${paths.assetsFull}/js/main.ts`,
			enhancements: `${paths.assetsFull}/js/enhancements.ts`,
			priority: `${paths.assetsFull}/js/priority.ts`,

			'style-base': `${paths.assetsFull}/js/style-base.ts`,
			'style-main': `${paths.assetsFull}/js/style-main.ts`,
			'style-contributing': `${paths.assetsFull}/js/style-contributing.ts`,
			'style-directory': `${paths.assetsFull}/js/style-directory.ts`,
			'style-document': `${paths.assetsFull}/js/style-document.ts`,
		},
		output: {
			path: paths.distFull,
			filename: `assets/js/[name]${cacheBustingString}.js`,
			publicPath: '/',
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					include: [
						`${paths.sharedFull}`,
					],
					use: [
						{
							loader: 'ts-loader',
							options: {
								configFile: 'tsconfig.shared.json',
							},
						},
					],
				},
				{
					test: /\.ts$/,
					include: [
						`${paths.assetsFull}`,
					],
					use: [
						{
							loader: 'ts-loader',
							options: {
								configFile: 'tsconfig.dom.json',
							},
						},
					],
				},
				{
					test: /\.ts$/,
					include: [
						`${paths.schemaFull}`,
					],
					use: [
						{
							loader: 'ts-loader',
							options: {
								configFile: 'tsconfig.schema.json',
								compilerOptions: {
									noEmit: false,
								},
							},
						},
					],
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
					'style-base',
					'style-contributing',
					'style-directory',
					'style-document',
					'style-main',
				],
			}),
		],
	});

	const serviceWorkerConfig: webpack.Configuration = Object.assign({}, baseConfig, {
		mode,
		optimization,
		devtool,

		entry: {
			'service-worker': `${paths.workers}/service-worker.ts`,
		},
		output: {
			path: paths.distFull,
			filename: `[name].js`,
			publicPath: '/',
		},
		resolve: {
			fullySpecified: true,
			extensionAlias: {
				'.js': ['.ts', '.js'],
			},
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					include: [
						`${paths.workersFull}`,
					],
					use: [
						{
							loader: 'ts-loader',
							options: {
								configFile: 'tsconfig.workers.json',
							},
						},
					],
				},
			],
		},
	});

	// Returning an array of configs is necessary to specify different output paths
	return [mainConfig, serviceWorkerConfig];
}

export default getConfig;
