import type { PolicyBuildStep } from './BuildStep.js';

import CopyPlugin from 'copy-webpack-plugin';
import GenerateJsonPlugin from 'generate-json-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { htmlWebpackPluginTemplateCustomizer as TemplateCustomizer } from 'template-ejs-loader';

import { toUrlSegment } from './util/to-url-segment.js';
import { makeRootRelative } from './util/make-root-relative.js';
import * as paths from './util/paths.js';

import { FileDocumentType } from '../schema/File.js';

import type { File as PolicyFile } from '../schema/File.js';
import type { AlternateFile } from '../schema/AlternateFile.js';
import type { Policy } from '../schema/Policy.js';
import type { Version } from '../schema/PolicyVersion.js';

/**
 * Build steps for a particular policy.
 */
export const policyBuildSteps: Record<string, PolicyBuildStep> = {
	/**
	 * Copy the metadata file for a policy to its destination
	 */
	copyMetadata(src, dst) {
		return [new CopyPlugin({
			patterns: [{ from: `${src}/metadata.json`, to: `${dst}.json` }],
		})];
	},

	/**
	 * Copy all files for a policy to their destinations
	 */
	copyFiles(src, dst, policy) {
		const plugins: CopyPlugin[] = [];

		function copyFile(file: PolicyFile | AlternateFile, versionUrl: string) {
			const fileSrcPathAndName = `${src}/${file.path}`;
			const fileName = file.path.replace(/.*\//, '');

			const fileDstPath = toUrlSegment(versionUrl);
			const fileDstPathAndName = `${dst}/${fileDstPath}/${fileName}`;

			plugins.push(
				new CopyPlugin({
					patterns: [{ from: fileSrcPathAndName, to: fileDstPathAndName }],
				})
			);

			// Update file.path to ensure the build HTML points to the correct place
			const fileDstPathRootRelative = makeRootRelative(fileDstPathAndName);
			file.path = fileDstPathRootRelative;
		}

		for (const version of policy.versions) {
			const versionName = version.name;
			const versionUrl = toUrlSegment(versionName);

			for (const file of version.files) {
				copyFile(file, versionUrl);

				if (file.alternateFiles) {
					for (const altFile of file.alternateFiles) {
						copyFile(altFile, versionUrl);
					}
				}
			}
		}

		return plugins;
	},

	/**
	 * Generate the HTML for a Policy page
	 */
	createPolicyPage(src, dst, policy) {
		const versionPaths: Record<string, string> = {};
		for (const version of policy.versions) {
			versionPaths[version.name] = toUrlSegment(version.name);
		}

		return [new HtmlWebpackPlugin({
			filename: `${dst}/index.html`,
			template: TemplateCustomizer({
				htmlLoaderOption: {
					sources: false,
				},
				templatePath: `${paths.templates}/pages/policy.ejs`,
				templateEjsLoaderOption: {
					data: {
						policy,
						versionPaths,
					},
				},
			}),
			chunks: ['priority', 'main', 'enhancements'],
		})];
	},

	/**
	 * Construct and copy all version metadata to its destination
	 */
	createVersionMetadata(src, dst, policy) {
		const plugins: GenerateJsonPlugin[] = [];

		for (const version of policy.versions) {
			plugins.push(createVersionMetadata(dst, policy, version));
		}

		const latest = policy.versions.find((version) => {
			return version.files.some((file) => {
				return file.documentType === FileDocumentType.POLICY && !file.incomplete;
			});
		});

		if (latest) {
			plugins.push(createVersionMetadata(dst, policy, latest, true));
		}

		return plugins;
	},

	/**
	 * Generate a page for each version of the policy
	 */
	createVersionPages(src, dst, policy) {
		const plugins: ReturnType<PolicyBuildStep> = [];

		for (const version of policy.versions) {
			plugins.push(createVersionPlugin(dst, policy, version));
		}

		const latest = policy.versions.find((version) => {
			return version.files.some((file) => {
				return file.documentType === FileDocumentType.POLICY && !file.incomplete;
			});
		});

		if (latest) {
			plugins.push(createVersionPlugin(dst, policy, latest, true));
		}

		return plugins;
	},
};

function createVersionMetadata(
	dst: string,
	policy: Policy,
	version: Version,
	latest: boolean = false
) {
	const versionName = version.name;
	const versionPathName = toUrlSegment(versionName);
	const versionDst = `${dst}/${versionPathName}`;

	const singleVersionPolicy = JSON.parse(JSON.stringify(policy));
	singleVersionPolicy.versions = singleVersionPolicy.versions.filter(
		(version) => version.name === versionName
	);

	return new GenerateJsonPlugin(
		`${latest ? `${dst}/latest` : versionDst}.json`,
		singleVersionPolicy,
		null,
		'\t'
	);
}

function createVersionPlugin(
	dst: string,
	policy: Policy,
	version: Version,
	latest: boolean = false
): HtmlWebpackPlugin {
	const versionName = version.name;
	const versionPathName = toUrlSegment(versionName);
	const versionDst = `${dst}/${versionPathName}`;

	return new HtmlWebpackPlugin({
		filename: latest ? `${dst}/latest/index.html` : `${versionDst}/index.html`,
		template: TemplateCustomizer({
			htmlLoaderOption: {
				sources: false,
			},
			templatePath: `${paths.templates}/pages/version.ejs`,
			templateEjsLoaderOption: {
				data: {
					policy,
					version,
					latest,
					versionDst,
				},
			},
		}),
		chunks: ['priority', 'main', 'enhancements'],
	});
}
