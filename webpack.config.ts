import * as webpack from 'webpack';

import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(import.meta.url);

import resolveTypeScriptPluginModule from 'resolve-typescript-plugin';
const ResolveTypeScriptPlugin = resolveTypeScriptPluginModule.default;

import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { htmlWebpackPluginTemplateCustomizer as TemplateCustomizer } from 'template-ejs-loader';

import { readdir } from 'fs/promises';

import { checkPolicyDir } from './schema/validate.js';
import AlterPlugin from './alter-plugin.js';

const entryPath = './assets';
const distPath = path.resolve(__dirname, '../dist');

const config: webpack.Configuration = {
	mode: process.env.MODE === 'development' ? 'development' : 'production',
	entry: {
		main: `${entryPath}/js/main.ts`,
		priority: `${entryPath}/js/priority.ts`,
		//style: `${entryPath}/css/style.scss`,
	},
	output: {
		path: distPath,
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

const result = (async () => {
	const dir = await readdir('./policies', {
		withFileTypes: true,
	});

	const promises: Promise<void>[] = [];
	const directory: Record<string, unknown> = {};

	for (const entry of dir) {
		if (!entry.isDirectory()) continue;

		promises.push(checkPolicyDir(entry, directory));
	}

	await Promise.all(promises);

	const policies = Object.keys(directory);
	policies.forEach((key) => {
		const policy = directory[key];

		// TODO: Also generate a page for each version of the policy
		config.plugins!.push(
			new CopyPlugin({
				patterns: [{ from: `./policies/${key}`, to: `./${key}` }],
			}),
			new HtmlWebpackPlugin({
				filename: `${key}/index.html`,
				template: TemplateCustomizer({
					templatePath: './templates/policy.ejs',
					templateEjsLoaderOption: {
						data: { policy },
					},
				}),
				// TODO: Loading `priority` here makes it deferred. Instead, we should load it directly in `head.ejs`
				chunks: ['main', 'priority'],
			})
		);
	});

	config.plugins!.push(
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: TemplateCustomizer({
				templatePath: './templates/directory.ejs',
				templateEjsLoaderOption: {
					data: {
						directory,
					},
				},
			}),
			chunks: ['main', 'priority'],
		}),
		new AlterPlugin({
			defer: ['main'],
		})
	);

	return config;
})();

export default result;
