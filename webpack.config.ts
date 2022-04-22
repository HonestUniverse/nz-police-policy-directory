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

import { readdir, writeFile } from 'fs/promises';
import type { Policy } from './data';
import type { Dirent } from 'fs';

const entryPath = './assets';
const distPath = path.resolve(__dirname, '../dist');

const config: webpack.Configuration = {
	mode: process.env.MODE === 'development' ? 'development' : 'production',
	entry: {
		main: `${entryPath}/js/index.ts`,
		style: `${entryPath}/css/style.scss`,
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

async function checkPolicy(entry: Dirent, masterList: Record<string, Policy>) {
	const dir = await readdir(`./files/${entry.name}`);

	if (dir.indexOf('data.json') === -1) return;

	const data: Policy = (
		await import(`./files/${entry.name}/data.json`, {
			assert: {
				type: 'json',
			},
		})
	).default;

	masterList[entry.name] = data;
}

const result = (async () => {
	const dir = await readdir('./files', {
		withFileTypes: true,
	});

	const promises: Promise<void>[] = [];
	const masterList: Record<string, Policy> = {};

	for (let i = 0, l = dir.length; i < l; ++i) {
		const entry = dir[i];
		if (!entry.isDirectory()) continue;

		promises.push(checkPolicy(entry, masterList));
	}

	await Promise.all(promises);

	const policies = Object.keys(masterList);
	policies.forEach((key) => {
		const policy = masterList[key];

		config.plugins!.push(
			new CopyPlugin({
				patterns: [{ from: `./files/${key}`, to: `./${key}` }],
			}),
			new HtmlWebpackPlugin({
				filename: `${key}/index.html`,
				template: TemplateCustomizer({
					templatePath: './templates/policy.ejs',
					templateEjsLoaderOption: {
						data: policy,
					},
				}),
				chunks: ['main', 'style'],
			})
		);
	});

	await writeFile('./config.json', JSON.stringify(config));

	return config;
})();

export default result;
