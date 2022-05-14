import * as webpack from 'webpack';

import dotenv from 'dotenv';
dotenv.config();

import resolveTypeScriptPluginModule from 'resolve-typescript-plugin';
const ResolveTypeScriptPlugin = resolveTypeScriptPluginModule;

import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import AlterPlugin from './build/util/alter-plugin.js';

import { createBuildPlugins } from './build/build.js';

import * as paths from './build/build-paths.js';

const config: webpack.Configuration = {
	mode: process.env.MODE === 'development' ? 'development' : 'production',
	entry: {
		main: `${paths.assetsFull}/js/main.ts`,
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
					'css-loader',
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
		...await createBuildPlugins(),
		new AlterPlugin({
			defer: ['main'],
			body: ['priority'],
			preload: ['priority'],
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

export default config;
