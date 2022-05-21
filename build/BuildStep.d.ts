import type { Configuration } from 'webpack';
import type { Policy } from '../schema/Policy.js';

declare type WebpackPlugins = NonNullable<Configuration["plugins"]>;

declare interface BuildStep<Data = unknown> {
	(src: string, dst: string, data: Data): WebpackPlugins | Promise<WebpackPlugins>,
}

export type PolicyBuildStep = BuildStep<Policy>;
export type DirectoryBuildStep = BuildStep<Record<string, Policy>>;
