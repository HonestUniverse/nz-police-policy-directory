import type { BuildStep } from './BuildStep.js';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import { htmlWebpackPluginTemplateCustomizer as TemplateCustomizer } from 'template-ejs-loader';

import * as paths from './util/paths.js';
import { makeRootRelative } from './util/make-root-relative.js';
import { Policy } from '../schema/Policy.js';

interface ContentBuildStepData {
	directory: Record<string, Policy>,
}

export const contentBuildSteps: Record<string, BuildStep<ContentBuildStepData>> = {
	/**
	 * Generate the HTML for the index page
	 */
	createIndexPage(src, dst, buildStepData) {
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
				chunks: ['priority', 'main', 'enhancements', 'style'],
			}),
		];
	},

	/**
	 * Generate the HTML for the 404 page
	 */
	create404Page(src, dst, buildStepData) {
		return [
			new HtmlWebpackPlugin({
				filename: `${dst}/404.html`,
				template: TemplateCustomizer({
					htmlLoaderOption: {
						sources: false,
					},
					templatePath: `${paths.templates}/pages/error.ejs`,
					templateEjsLoaderOption: {
						data: {
							error: 404,
							errorString: "Page Not Found.",
						},
					},
				}),
				chunks: ['priority', 'main', 'enhancements', 'style-content'],
			}),
		];
	},

	/**
	 * Generate the HTML for the About page
	 */
	createAboutPage(src, dst, buildStepData) {
		return [
			new HtmlWebpackPlugin({
				filename: `${dst}/about/index.html`,
				template: TemplateCustomizer({
					htmlLoaderOption: {
						sources: false,
					},
					templatePath: `${paths.templates}/pages/about.ejs`,
					templateEjsLoaderOption: {
						data: {},
					},
				}),
				chunks: ['priority', 'main', 'enhancements', 'style-content'],
			}),
		];
	},

	/**
	 * Generate the HTML for the Accessibility page
	 */
	createAccessibilityPage(src, dst, buildStepData) {
		return [
			new HtmlWebpackPlugin({
				filename: `${dst}/accessibility/index.html`,
				template: TemplateCustomizer({
					htmlLoaderOption: {
						sources: false,
					},
					templatePath: `${paths.templates}/pages/accessibility.ejs`,
					templateEjsLoaderOption: {
						data: {},
					},
				}),
				chunks: ['priority', 'main', 'enhancements', 'style-content'],
			}),
		];
	},

	/**
	 * Generate the HTML for the How to Use page
	 */
	createHowToUsePage(src, dst, buildStepData) {
		return [
			new HtmlWebpackPlugin({
				filename: `${dst}/how-to-use/index.html`,
				template: TemplateCustomizer({
					htmlLoaderOption: {
						sources: false,
					},
					templatePath: `${paths.templates}/pages/how-to-use.ejs`,
					templateEjsLoaderOption: {
						data: {
							paths: {
								policies: makeRootRelative(paths.policiesDst),
							},
							directory: buildStepData.directory,
						},
					},
				}),
				chunks: ['priority', 'main', 'enhancements', 'style'],
			}),
		];
	},
};
