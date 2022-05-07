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

import { readdir, readFile } from 'fs/promises';
import type { Dirent } from 'fs';

import { validatePolicy } from './schema/validate.js';
import type { PolicyVersionFile } from './schema/PolicyVersionFile.js';
import type { Policy } from './schema/Policy.js';

const entryPath = './assets';
const distPath = path.resolve(__dirname, '../dist');

const config: webpack.Configuration = {
	mode: process.env.MODE === 'development' ? 'development' : 'production',
	entry: {
		main: `${entryPath}/js/main.ts`,
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

function getFileSizeValidator(dirName: string) {
	return async function validateFileSize(file: PolicyVersionFile) {
		const filePath = `${dirName}/${file.path}`;
		const handle = await readFile(filePath);

		if (file.size !== handle.byteLength) {
			console.warn(`WARNING: Incorrect file size for ${filePath}. Was ${file.size}, should be ${handle.byteLength}`);
			file.size = handle.byteLength;
		}
	}
}

async function validateFileSizes(dirName, policy: Policy) {
	const validateFileSize = getFileSizeValidator(dirName);

	const filePromises: Promise<void>[] = [];
	for (const version of policy.versions) {
		filePromises.push(...version.files.map(validateFileSize));
	}

	return Promise.all(filePromises);
}

async function checkPolicy(entry: Dirent, directory: Record<string, unknown>) {
	const dirName = `./policies/${entry.name}`;
	const dir = await readdir(dirName);

	if (dir.indexOf('metadata.json') === -1) return;

	const data: unknown = (
		await import(`./policies/${entry.name}/metadata.json`, {
			assert: {
				type: 'json',
			},
		})
	).default;

	const valid = validatePolicy(data);
	if (!valid) {
		console.error(validatePolicy.errors);
		throw new TypeError(`Cannot build site due to invalid metadata in ${entry.name}`);
	}

	await validateFileSizes(dirName, data);

	directory[entry.name] = data;
}

const result = (async () => {
	const dir = await readdir('./policies', {
		withFileTypes: true,
	});

	const promises: Promise<void>[] = [];
	const directory: Record<string, unknown> = {};

	for (let i = 0, l = dir.length; i < l; ++i) {
		const entry = dir[i];
		if (!entry.isDirectory()) continue;

		promises.push(checkPolicy(entry, directory));
	}

	await Promise.all(promises);

	const policies = Object.keys(directory);
	policies.forEach((key) => {
		const policy = directory[key];

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
				chunks: ['main', 'style'],
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
						directory
					},
				}
			})
		})
	);

	return config;
})();

export default result;
