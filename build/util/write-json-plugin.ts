import type { Compiler, WebpackPluginInstance } from 'webpack';

// import { Compilation } from 'webpack';
import Webpack from 'webpack';
const { Compilation } = Webpack;

const PLUGIN_NAME = 'WriteJsonPlugin';

export default class WriteJsonPlugin implements WebpackPluginInstance {
	private filename: string;
	private value: unknown;
	private replacer: Parameters<typeof JSON.stringify>[1];
	private space: Parameters<typeof JSON.stringify>[2];

	constructor(
		filename: string,
		value: unknown,
		replacer: Parameters<typeof JSON.stringify>[1],
		space: Parameters<typeof JSON.stringify>[2],
	) {
		this.filename = filename;
		this.value = value;
		this.replacer = replacer;
		this.space = space;
	}

	apply(compiler: Compiler) {
		compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
			const jsonString = JSON.stringify(this.value, this.replacer, this.space);

			compilation.hooks.processAssets.tap(
				{
					name: PLUGIN_NAME,
					stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
				},
				(assets) => {
					// @ts-expect-error I'm not really sure why the `Source` type is defined to need the properties missing here
					assets[this.filename] = {
						source: () => jsonString,
						size: () => jsonString.length,
					};
				}
			);
		});
	}
}
