import type { Compiler, WebpackPluginInstance } from 'webpack';

// import { Compilation } from 'webpack';
import Webpack from 'webpack';
const { Compilation } = Webpack;

const PLUGIN_NAME = 'WriteFilePlugin';

export default class WriteFilePlugin implements WebpackPluginInstance {
	private filename: string;
	private value: string;

	constructor(
		filename: string,
		value: string,
	) {
		this.filename = filename;
		this.value = value;
	}

	apply(compiler: Compiler) {
		compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
			compilation.hooks.processAssets.tap(
				{
					name: PLUGIN_NAME,
					stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
				},
				(assets) => {
					// @ts-expect-error I'm not really sure why the `Source` type is defined to need the properties missing here
					assets[this.filename] = {
						source: () => this.value,
						size: () => this.value.length,
					};
				}
			);
		});
	}
}
