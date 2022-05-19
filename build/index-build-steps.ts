import type { BuildStep } from './BuildStep.js';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import { htmlWebpackPluginTemplateCustomizer as TemplateCustomizer } from 'template-ejs-loader';

import * as paths from './util/paths.js';
import { makeRootRelative } from './util/make-root-relative.js';

export const indexBuildSteps: Record<string, BuildStep> = {
	/**
	 * Generate the HTML for the index page
	 */
	createIndexPage(src, dst, directory) {
		return [
			new HtmlWebpackPlugin({
				filename: `${dst}/index.html`,
				template: TemplateCustomizer({
					htmlLoaderOption: {
						sources: false,
					},
					templatePath: `${paths.templates}/pages/index.ejs`,
					templateEjsLoaderOption: {
						data: {
							paths: {
								policies: makeRootRelative(paths.policiesDst),
							},
						},
					},
				}),
				chunks: ['priority', 'main', 'enhancements'],
			}),
		];
	},
};
