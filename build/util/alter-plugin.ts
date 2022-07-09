import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import type { Compiler } from 'webpack';

class AlterPlugin {
	private async: string[];
	private defer: string[];
	private body: string[];
	private preload: string[];
	private module: string[];
	private remove: string[];

	constructor(options?: {
		async?: string[];
		defer?: string[];
		body?: string[];
		preload?: string[];
		module?: string[];
		remove?: string[];
	}) {
		const { async, defer, body, preload, module, remove } = {
			async: [],
			defer: [],
			body: [],
			preload: [],
			module: [],
			remove: [],
			...options,
		};

		this.async = async;
		this.defer = defer;
		this.body = body;
		this.preload = preload;
		this.module = module;
		this.remove = remove;
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
				for (let i = 0; i < data.assetTags.scripts.length; i++) {
					const tag = data.assetTags.scripts[i];

					const name = getChunkName(tag.attributes.src as string, data.publicPath);

					delete tag.attributes.defer;
					delete tag.attributes.async;

					if (this.async.includes(name)) {
						tag.attributes.async = true;
					}

					if (this.defer.includes(name)) {
						tag.attributes.defer = true;
					}

					if (this.module.includes(name)) {
						tag.attributes.type = 'module';
					}

					if (this.remove.includes(name)) {
						data.assetTags.scripts.splice(i, 1);
						i -= 1;
					}
				}

				callback(false, data);
			});

			hooks.alterAssetTagGroups.tapAsync('AlterPlugin', (data, callback) => {
				const headTags: HtmlWebpackPlugin.HtmlTagObject[] = [];
				const bodyTags: HtmlWebpackPlugin.HtmlTagObject[] = [];

				const loop = (
					tag: HtmlWebpackPlugin.HtmlTagObject,
					tagLoc: HtmlWebpackPlugin.HtmlTagObject[]
				) => {
					const name = getChunkName(
						(tag.attributes.src ?? tag.attributes.href) as string,
						data.publicPath
					);

					if (this.preload.includes(name))
						headTags.unshift({
							tagName: 'link',
							attributes: {
								rel: 'preload',
								href: tag.attributes.src ?? tag.attributes.href,
								as: 'script',
							},
							voidTag: true,
							meta: {
								plugin: 'AlterPlugin',
							},
						});

					if (tag.tagName !== 'script') return tagLoc.push(tag);

					if (this.body.includes(name)) return bodyTags.push(tag);
					headTags.push(tag);
				};

				data.headTags.forEach((val) => loop(val, headTags));
				data.bodyTags.forEach((val) => loop(val, bodyTags));

				callback(false, {
					...data,
					headTags,
					bodyTags,
				});
			});

			hooks.afterEmit.tapAsync('AlterPlugin', (data, callback) => {
				const source = String(compilation.assets[data.outputName].source());

				const bodyTag = source.match(/<body.*?>/)?.[0];
				if (!bodyTag) {
					if (source.includes('Error:')) {
						// No need to report an error, since it will already be included in output
						callback(false, data);
						return;
					} else {
						callback(new Error(`Cannot find opening body tag in output ${data.outputName}`), data);
						return;
					}
				}

				const bodyStart = source.indexOf(bodyTag) + bodyTag.length;
				const body = source.match(/<body.+<\/body>/s)?.[0];
				if (!body) {
					callback(new Error(`Cannot find closing body tag in output ${data.outputName}`));
					return;
				}

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
