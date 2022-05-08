import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as webpack from 'webpack';

class AlterPlugin {
	private async: string[];
	private defer: string[];

	constructor(options?: { async?: string[]; defer?: string[] }) {
		const { async, defer } = {
			async: [],
			defer: [],
			...options,
		};

		this.async = async;
		this.defer = defer;

		console.log(async, defer);
	}

	apply(compiler: webpack.Compiler) {
		compiler.hooks.compilation.tap('AlterPlugin', (compilation) => {
			const getChunkName = (filename: string) => {
				const chunk = [...compilation.chunks].find((chunk) => {
					return [...chunk.files].includes(filename);
				});

				if (chunk) return chunk.name;
				return '';
			};

			HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync(
				'AlterPlugin',
				(data, callback) => {
					data.assetTags.scripts.forEach((tag) => {
						const name = getChunkName(tag.attributes.src as string);

						delete tag.attributes.defer;
						delete tag.attributes.async;

						if (this.async.includes(name)) {
							tag.attributes.async = true;
						}

						if (this.defer.includes(name)) {
							tag.attributes.defer = true;
						}
					});

					callback(false, data);
				}
			);
		});
	}
}

export default AlterPlugin;
