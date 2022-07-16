import type { BuildStep } from './BuildStep.js';

import CopyPlugin from 'copy-webpack-plugin';

/**
 * Build steps for assets.
 */
export const assetBuildSteps: Record<string, BuildStep> = {
	/**
	 * Copy Montserrat font files to dist
	 */
	copyMontserrat(src, dst) {
		return [
			new CopyPlugin({
				patterns: [{
					from: `${src}/fonts/montserrat/**/*`,
					to() {
						return `${dst}/fonts/montserrat/[name][ext]`;
					},
				}],
			}),
		];
	},

	/**
	 * Copy Roboto font files to dist
	 */
	copyRoboto(src, dst) {
		return [
			new CopyPlugin({
				patterns: [{
					from: `${src}/fonts/roboto/**/*`,
					to() {
						return `${dst}/fonts/roboto/[name][ext]`;
					},
				}],
			}),
		];
	},

	/**
	 * Copy font icons to dist
	 */
	copyFontIcons(src, dst) {
		return [
			new CopyPlugin({
				patterns: [{
					from: `${src}/fonts/font-icons/fonts/**/*`,
					to() {
						return `${dst}/fonts/font-icons/[name][ext]`;
					},
				}],
			}),
		];
	},

	/**
	 * Copy assets that should sit in the root to dist
	 */
	copyRootAssets(src, dst) {
		return [
			new CopyPlugin({
				patterns: [{
					from: `${src}/root/**/*`,
					to() {
						return `${dst}/../[name][ext]`;
					},
				}],
			}),
		];
	},
};
