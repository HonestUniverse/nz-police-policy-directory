import type { DirectoryBuildStep } from './BuildStep.js';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import { htmlWebpackPluginTemplateCustomizer as TemplateCustomizer } from 'template-ejs-loader';

import * as paths from './util/paths.js';

export const directoryBuildSteps: Record<string, DirectoryBuildStep> = {
	/**
	 * Generate the HTML for the Directory page
	 */
	buildDirectoryPage(src, dst, directory) {
		return [
			new HtmlWebpackPlugin({
				filename: `${dst}/index.html`,
				template: TemplateCustomizer({
					templatePath: `${paths.src}/templates/directory.ejs`,
					templateEjsLoaderOption: {
						data: {
							directory,
						},
					},
				}),
				chunks: ['main', 'priority'],
			}),
		];
	}
};
