import type { Configuration } from 'webpack';
type WebpackPlugins = NonNullable<Configuration["plugins"]>;
type WebpackPlugin = WebpackPlugins[number];

import { readdir } from 'fs/promises';

import { toUrlSegment } from './util/to-url-segment.js';

import type { Policy } from '../schema/definitions/Policy.js';
import { readPolicyFile } from './read-policy.js';

import AlterPlugin from './util/alter-plugin.js';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { htmlWebpackPluginTemplateCustomizer as TemplateCustomizer } from 'template-ejs-loader';

/**
 * Read all policy files, and return an object mapping each
 * policy's paths to its data.
 */
async function readAllPolicies(srcPath: string): Promise<Record<string, Policy>> {
	const policiesDir = `${srcPath}/policies`;
	const dir = await readdir(policiesDir, {
		withFileTypes: true,
	});

	const promises: Promise<Policy>[] = [];
	const policies: Record<string, Policy> = {};

	for (const entry of dir) {
		if (!entry.isDirectory()) continue;

		const policyPromise = readPolicyFile(`${policiesDir}/${entry.name}`);
		policyPromise.then((policy) => policies[entry.name] = policy);

		promises.push(policyPromise);
	}

	await Promise.allSettled(promises);

	return policies;
}

function copyPolicyMetadata(srcPath: string, dstPath: string): WebpackPlugin {
	return new CopyPlugin({
		patterns: [{ from: `${srcPath}/metadata.json`, to: `${dstPath}/metadata.json` }],
	});
}

function copyPolicyFiles(srcPath: string, dstPath: string, policy: Policy): WebpackPlugin[] {
	const plugins: CopyPlugin[] = [];

	for (const version of policy.versions) {
		const versionName = version.name;
		const versionUrl = toUrlSegment(versionName);

		for (const file of version.files) {
			const fileSrcPathAndName = `${srcPath}/${file.path}`;
			const fileName = file.path.replace(/.*\//, '');

			const fileDstPath = toUrlSegment(versionUrl);
			const fileDstPathAndName = `${dstPath}/${fileDstPath}/${fileName}`;

			plugins.push(
				new CopyPlugin({
					patterns: [{ from: fileSrcPathAndName, to: fileDstPathAndName }],
				})
			);

			// Update file.path to ensure the build HTML points to the correct place
			file.path = `${fileDstPath}/${fileName}`;
		}
	}

	return plugins;
}

function constructPolicyHtml(srcPath: string, dstPath: string, policy: Policy): WebpackPlugin {
	return new HtmlWebpackPlugin({
		filename: `${dstPath}/index.html`,
		template: TemplateCustomizer({
			templatePath: `${srcPath}/templates/policy.ejs`,
			templateEjsLoaderOption: {
				data: { policy },
			},
		}),
		chunks: ['main', 'priority'],
	});
}

// TODO: Refactor and document
export async function createBuildPlugins(srcPath: string): Promise<WebpackPlugins> {
	const plugins: WebpackPlugins = [];

	const policiesByName = await readAllPolicies(srcPath);
	const policiesByNameSafe: Record<string, Policy> = {};

	const policyNames = Object.keys(policiesByName);
	policyNames.forEach((policyName) => {
		const policy = policiesByName[policyName];
		const policyNameSafe = toUrlSegment(policyName);

		policiesByNameSafe[policyNameSafe] = policy;

		const policySrcPath = `${srcPath}/policies/${policyName}`;
		const policyDstPath = `./${policyNameSafe}`;

		// Copy policy metadata
		plugins.push(copyPolicyMetadata(policySrcPath, policyDstPath));

		// Loop through versions and files, and copy each file to its destination
		plugins.push(...copyPolicyFiles(policySrcPath, policyDstPath, policy));

		// TODO: Also generate a page for each version of the policy

		// Construct policy HTML
		plugins.push(
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

	plugins.push(
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: TemplateCustomizer({
				templatePath: `${srcPath}/templates/directory.ejs`,
				templateEjsLoaderOption: {
					data: {
						directory: policiesByNameSafe,
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

	return plugins;
}
