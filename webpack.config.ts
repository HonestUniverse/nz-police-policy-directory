import * as webpack from 'webpack';

import dotenv from 'dotenv';
dotenv.config();

import resolveTypeScriptPluginModule from 'resolve-typescript-plugin';
const ResolveTypeScriptPlugin = resolveTypeScriptPluginModule;

import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import AlterPlugin from './build/util/alter-plugin.js';

import { createBuildPlugins } from './build/build.js';

import * as paths from './build/util/paths.js';

async function getConfig(env: Record<string, unknown>) {
	const config: webpack.Configuration = {
		mode: process.env.MODE === 'development' ? 'development' : 'production',
		entry: {
			main: `${paths.assetsFull}/js/main.ts`,
			enhancements: `${paths.assetsFull}/js/enhancements.ts`,
			priority: `${paths.assetsFull}/js/priority.ts`,
		},
		output: {
			path: paths.distFull,
			filename: 'assets/js/[name].js',
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
				filename: 'assets/css/[name].css',
				chunkFilename: '[id].css',
				ignoreOrder: false,
			}),
			...await createBuildPlugins(env.test ? paths.testPolicies : paths.policies),
			new AlterPlugin({
				defer: ['main', 'enhancements'],
				body: ['priority'],
				preload: ['priority'],
				module: ['enhancements'],
			}),
		],
	};

	switch (process.env.MODE) {
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
