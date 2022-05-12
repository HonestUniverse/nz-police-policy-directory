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
import type { Policy } from './schema/definitions/Policy.js';

import { toUrlSegment } from './build-util/to-url-segment.js';
import AlterPlugin from './build-util/alter-plugin.js';

const srcPath = path.resolve(__dirname, '../src');
const entryPath = `${srcPath}/assets`;
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
	const policiesDir = `${srcPath}/policies`;
	const dir = await readdir(policiesDir, {
		withFileTypes: true,
	});

	const promises: Promise<void>[] = [];
	const srcDirectory: Record<string, Policy> = {};
	const dstDirectory: Record<string, Policy> = {};

	for (const entry of dir) {
		if (!entry.isDirectory()) continue;

		promises.push(checkPolicyDir(policiesDir, entry, srcDirectory));
	}

	await Promise.all(promises);

	const policies = Object.keys(srcDirectory);
	policies.forEach((key) => {
		const policy = srcDirectory[key];

		const policySrcPath = `${srcPath}/policies/${key}`;
		const policyDstPath = `./${toUrlSegment(key)}`;

		dstDirectory[toUrlSegment(key)] = policy;

		// Copy policy metadata
		config.plugins!.push(
			new CopyPlugin({
				patterns: [{ from: `${policySrcPath}/metadata.json`, to: `${policyDstPath}/metadata.json` }],
			})
		);

		// Loop through versions and files, and copy each file to its destination
		for (const version of policy.versions) {
			const versionName = version.name;
			const versionUrl = toUrlSegment(versionName);

			// TODO: Also generate a page for each version of the policy

			for (const file of version.files) {
				const fileSrcPathAndName = `${policySrcPath}/${file.path}`;
				const fileName = file.path.replace(/.*\//, '');

				const fileDstPath = toUrlSegment(versionUrl);
				const fileDstPathAndName = `${policyDstPath}/${fileDstPath}/${fileName}`;

				config.plugins!.push(
					new CopyPlugin({
						patterns: [{ from: fileSrcPathAndName, to: fileDstPathAndName }],
					})
				);

				// Update file.path to ensure the build HTML points to the correct place
				file.path = `${fileDstPath}/${fileName}`;
			}
		}

		// Construct policy HTML
		config.plugins!.push(
			new HtmlWebpackPlugin({
				filename: `${policyDstPath}/index.html`,
				template: TemplateCustomizer({
					templatePath: `${srcPath}/templates/policy.ejs`,
					templateEjsLoaderOption: {
						data: { policy },
					},
				}),
				chunks: ['main', 'priority'],
			})
		);
	});

	config.plugins!.push(
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: TemplateCustomizer({
				templatePath: `${srcPath}/templates/directory.ejs`,
				templateEjsLoaderOption: {
					data: {
						directory: dstDirectory,
					},
				},
			}),
			chunks: ['main', 'priority'],
		}),
		new AlterPlugin({
			defer: ['main'],
			body: ['priority'],
			preload: ['priority'],
		})
	);

	return config;
})();

export default result;
