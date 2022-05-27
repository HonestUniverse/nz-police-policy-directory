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
import { readFile } from 'fs/promises';

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

		function copyFile(file: PolicyFile | AlternateFile, version: Version) {
			const fileSrcPathAndName = `${src}/${file.path}`;
			const fileDst = getFileDst(dst, file, version);

			plugins.push(
				new CopyPlugin({
					patterns: [{ from: fileSrcPathAndName, to: fileDst }],
				})
			);

			// Update file.path to ensure the build HTML points to the correct place
			makeFilePathRootRelative(dst, file, version);
		}

		for (const version of policy.versions) {
			for (const file of version.files) {
				copyFile(file, version);

				if (file.alternateFiles) {
					for (const altFile of file.alternateFiles) {
						if (altFile.type !== 'text/html') {
							copyFile(altFile, version);
						}
					}
				}
			}
		}

		return plugins;
	},

	/**
	 * Build any HTML-based alternate files
	 */
	async createHtmlAlternateFiles(src, dst, policy) {
		const plugins: HtmlWebpackPlugin[] = [];

		for (const version of policy.versions) {
			for (const parentFile of version.files) {
				if (parentFile.alternateFiles) {
					for (const file of parentFile.alternateFiles) {
						if (file.type === 'text/html') {
							const fileDst = getFileDst(dst, file, version);

							const documentBuffer = await readFile(`${src}/${file.path}`);
							const document = documentBuffer.toString();

							plugins.push(new HtmlWebpackPlugin({
								filename: `${fileDst}`,
								template: TemplateCustomizer({
									htmlLoaderOption: {
										sources: false,
									},
									templatePath: `${paths.templates}/pages/document.ejs`,
									templateEjsLoaderOption: {
										data: {
											document,
											parentFile,
											version,
											policy,
										},
									},
								}),
								chunks: ['priority', 'main', 'enhancements', 'style-document'],
							}));

							// Update file.path to ensure the build HTML points to the correct place
							makeFilePathRootRelative(dst, file, version);
						}
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
			chunks: ['priority', 'main', 'enhancements', 'style'],
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

/**
 * Create a root-relative path for a file, and save it over its `path` property
 */
function makeFilePathRootRelative(
	dst: string,
	file: PolicyFile | AlternateFile,
	version: Version,
) {
	const fileDst = getFileDst(dst, file, version);
	const fileDstRootRelative = makeRootRelative(fileDst);
	file.path = fileDstRootRelative;
}

/**
 * Construct the dst path for a file, based on its version
 */
function getFileDst(
	dst: string,
	file: PolicyFile | AlternateFile,
	version: Version,
) {
	const versionName = version.name;
	const versionUrl = toUrlSegment(versionName);

	const fileName = file.path.replace(/.*\//, '');
	const fileDstPath = toUrlSegment(versionUrl);
	const fileDstPathAndName = `${dst}/${fileDstPath}/${fileName}`;

	return fileDstPathAndName;
}

function createVersionMetadata(
	dst: string,
	policy: Policy,
	version: Version,
	latest: boolean = false,
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
	latest: boolean = false,
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
		chunks: ['priority', 'main', 'enhancements', 'style'],
	});
}
