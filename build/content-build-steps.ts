import HtmlWebpackPlugin from 'html-webpack-plugin';
import { htmlWebpackPluginTemplateCustomizer as TemplateCustomizer } from 'template-ejs-loader';

import * as paths from './util/paths.js';
import { defaultChunks } from './util/defaultChunks.js';

import type { ContentBuildStep } from './BuildStep.js';

export const contentBuildSteps: Record<string, ContentBuildStep> = {
	/**
	 * Generate the HTML for the index page
	 */
	createIndexPage(src, dst, buildStepData) {
		const {
			siteData,
			...pageData
		} = buildStepData;

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
	 * Generate the HTML for the 404 page
	 */
	create404Page(src, dst, buildStepData) {
		const {
			siteData,
			...basePageData
		} = buildStepData;

		const pageData = {
			...basePageData,
			error: 404,
			errorString: 'Page Not Found.',
		};

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
							siteData,
							pageData,
						},
					},
				}),
				chunks: [
					...defaultChunks,
				],
			}),
		];
	},

	/**
	 * Generate the HTML for the 408 (Request Timeout) page
	 */
	create408Page(src, dst, buildStepData) {
		const {
			siteData,
			...basePageData
		} = buildStepData;

		const pageData = {
			...basePageData,
			error: 'Network Error',
			errorTitle: 'Network Error',
			errorString: 'Please check your internet connection.',
		};

		return [
			new HtmlWebpackPlugin({
				filename: `${dst}/408.html`,
				template: TemplateCustomizer({
					htmlLoaderOption: {
						sources: false,
					},
					templatePath: `${paths.templates}/pages/error.ejs`,
					templateEjsLoaderOption: {
						data: {
							siteData,
							pageData,
						},
					},
				}),
				chunks: [
					...defaultChunks,
				],
			}),
		];
	},

	/**
	 * Generate the HTML for the About page
	 */
	createAboutPage(src, dst, buildStepData) {
		const {
			siteData,
			...pageData
		} = buildStepData;

		return [
			new HtmlWebpackPlugin({
				filename: `${dst}/${paths.aboutDst}/index.html`,
				template: TemplateCustomizer({
					htmlLoaderOption: {
						sources: false,
					},
					templatePath: `${paths.templates}/pages/about.ejs`,
					templateEjsLoaderOption: {
						data: {
							siteData,
							pageData,
						},
					},
				}),
				chunks: [
					...defaultChunks,
				],
			}),
		];
	},

	/**
	 * Generate the HTML for the Accessibility page
	 */
	createAccessibilityPage(src, dst, buildStepData) {
		const {
			siteData,
			...pageData
		} = buildStepData;

		return [
			new HtmlWebpackPlugin({
				filename: `${dst}/${paths.accessibilityDst}/index.html`,
				template: TemplateCustomizer({
					htmlLoaderOption: {
						sources: false,
					},
					templatePath: `${paths.templates}/pages/accessibility.ejs`,
					templateEjsLoaderOption: {
						data: {
							siteData,
							pageData,
						},
					},
				}),
				chunks: [
					...defaultChunks,
				],
			}),
		];
	},

	/**
	 * Generate the HTML for the How to Use page
	 */
	createHowToUsePage(src, dst, buildStepData) {
		const {
			siteData,
			...pageData
		} = buildStepData;

		return [
			new HtmlWebpackPlugin({
				filename: `${dst}/${paths.howToUseDst}/index.html`,
				template: TemplateCustomizer({
					htmlLoaderOption: {
						sources: false,
					},
					templatePath: `${paths.templates}/pages/how-to-use.ejs`,
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
	 * Generate the HTML for the Contributing page
	 */
	createContributingPage(src, dst, buildStepData) {
		const {
			siteData,
			...pageData
		} = buildStepData;

		return [
			new HtmlWebpackPlugin({
				filename: `${dst}/${paths.contributingDst}/index.html`,
				template: TemplateCustomizer({
					htmlLoaderOption: {
						sources: false,
					},
					templatePath: `${paths.templates}/pages/contributing.ejs`,
					templateEjsLoaderOption: {
						data: {
							siteData,
							pageData,
						},
					},
				}),
				chunks: [
					...defaultChunks,
					'style-contributing',
				],
			}),
		];
	},
};
