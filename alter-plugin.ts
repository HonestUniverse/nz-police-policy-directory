import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import type { Compiler } from 'webpack';

class AlterPlugin {
	private async: string[];
	private defer: string[];
	private body: string[];

	constructor(options?: { async?: string[]; defer?: string[]; body?: string[] }) {
		const { async, defer, body } = {
			async: [],
			defer: [],
			body: [],
			...options,
		};

		this.async = async;
		this.defer = defer;
		this.body = body;
	}

	apply(compiler: Compiler) {
		const webpack = compiler.webpack;

		compiler.hooks.compilation.tap('AlterPlugin', (compilation) => {
			const getChunkName = (filename: string, publicPath: string) => {
				const filePath = path.relative(publicPath, filename).replace(/\\/g, '/');

				const chunk = [...compilation.chunks].find((chunk) => {
					return [...chunk.files].includes(filePath);
				});

				if (chunk) return chunk.name;
				return '';
			};

			const hooks = HtmlWebpackPlugin.getHooks(compilation);

			hooks.alterAssetTags.tapAsync('AlterPlugin', (data, callback) => {
				data.assetTags.scripts.forEach((tag) => {
					const name = getChunkName(tag.attributes.src as string, data.publicPath);

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
			});

			hooks.alterAssetTagGroups.tapAsync('AlterPlugin', (data, callback) => {
				const headTags: HtmlWebpackPlugin.HtmlTagObject[] = [];
				const bodyTags: HtmlWebpackPlugin.HtmlTagObject[] = [];

				[...data.headTags, ...data.bodyTags].forEach((tag) => {
					if (tag.tagName !== 'script') return headTags.push(tag);

					const name = getChunkName(tag.attributes.src as string, data.publicPath);
					if (this.body.includes(name)) return bodyTags.push(tag);
					headTags.push(tag);
				});

				callback(false, {
					...data,
					headTags,
					bodyTags,
				});
			});

			hooks.afterEmit.tapAsync('AlterPlugin', (data, callback) => {
				const source = compilation.assets[data.outputName].source() as string;

				const bodyTag = source.match(/<body.*?>/)?.[0] as string;
				const bodyStart = source.indexOf(bodyTag) + bodyTag.length;
				const body = source.match(/<body.+<\/body>/)?.[0] as string;

				const scripts = body.match(/(<script[^>]+src.+?<\/script>)/g);

				if (!scripts) {
					callback(false, data);
					return;
				}

				const bodyLess = scripts.reduce((prev, curr) => {
					return prev.replace(curr, '');
				}, body);

				const newHtml = [...source.replace(body, bodyLess)];
				newHtml.splice(bodyStart, 0, scripts.join(''));

				compilation.assets[data.outputName] = new webpack.sources.RawSource(
					newHtml.join(''),
					false
				);

				callback(false, data);
			});
		});
	}
}

export default AlterPlugin;
