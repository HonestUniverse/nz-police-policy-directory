import type { DirectoryBuildStep } from './BuildStep.js';

import WriteFilePlugin from './util/write-file-plugin.js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { htmlWebpackPluginTemplateCustomizer as TemplateCustomizer } from 'template-ejs-loader';

import * as paths from './util/paths.js';
import { defaultChunks } from './util/defaultChunks.js';

import { toSearchIndex } from '../src/shared/SearchIndex.js';

export const directoryBuildSteps: Record<string, DirectoryBuildStep> = {
	/**
	 * Generate the JSON file for the directory
	 */
	createDirectoryMetadata(src, dst, buildData) {
		const { directory } = buildData;
		const data = Object.values(directory);

		return [new WriteFilePlugin(
			`${dst}.json`,
			JSON.stringify(data, null, '\t'),
		)];
	},

	/**
	 * Generate the JSON file used as a search index
	 */
	createSearchIndex(src, dst, buildData) {
		const index = toSearchIndex(buildData.directory);
		const fileDst = `${dst}/../search.json`;

		return [new WriteFilePlugin(
			fileDst,
			JSON.stringify(index, null, '\t'),
		)];
	},

	/**
	 * Generate the HTML for the Directory page
	 */
	createDirectoryPage(src, dst, buildData) {
		const {
			siteData,
			...pageData
		} = buildData;

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
							siteData,
							pageData,
						},
					},
				}),
				chunks: [
					...defaultChunks,
					'style-main',
				],
			}),
		];
	},

	/**
	 * Generate a page reporting which content needs attention
	 */
	createContentReportPage(src, dst, buildData) {
		const {
			siteData,
			...pageData
		} = buildData;

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
							siteData,
							pageData,
						},
					},
				}),
				chunks: [
					...defaultChunks,
					'style-main',
				],
			}),
		];
	},
};
