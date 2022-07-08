import type { DirectoryBuildStep } from './BuildStep.js';

import GenerateJsonPlugin from 'generate-json-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { htmlWebpackPluginTemplateCustomizer as TemplateCustomizer } from 'template-ejs-loader';

import * as paths from './util/paths.js';
import { makeRootRelative } from './util/make-root-relative.js';

export const directoryBuildSteps: Record<string, DirectoryBuildStep> = {
	/**
	 * Generate the JSON file for the directory
	 */
	createDirectoryMetadata(src, dst, directory) {
		const data = Object.values(directory);

		return [new GenerateJsonPlugin(
			`${dst}.json`,
			data,
			null,
			'\t'
		)];
	},

	/**
	 * Generate the HTML for the Directory page
	 */
	createDirectoryPage(src, dst, directory) {
		return [
			new HtmlWebpackPlugin({
				filename: `${dst}/index.html`,
				template: TemplateCustomizer({
					htmlLoaderOption: {
						sources: false,
					},
					templatePath: `${paths.templates}/pages/directory.ejs`,
					templateEjsLoaderOption: {
						data: {
							directory,
							paths: {
								policies: makeRootRelative(paths.policiesDst),
							},
						},
					},
				}),
				chunks: ['priority', 'main', 'enhancements', 'style'],
			}),
		];
	},

	/**
	 * Generate a page reporting which content needs attention
	 */
	createContentReportPage(src, dst, directory) {
		return [
			new HtmlWebpackPlugin({
				filename: `${dst}/content-report.html`,
				template: TemplateCustomizer({
					htmlLoaderOption: {
						sources: false,
					},
					templatePath: `${paths.templates}/pages/content-report.ejs`,
					templateEjsLoaderOption: {
						data: {
							directory,
							paths: {
								policies: makeRootRelative(paths.policiesDst),
							},
						},
					},
				}),
				chunks: ['priority', 'main', 'enhancements', 'style'],
			}),
		];
	},
};
