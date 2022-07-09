import type { Configuration } from 'webpack';
import type { Policy } from '../schema/Policy.js';
import type { SiteData } from './util/get-site-data.js';

declare type PageBuildData<T extends Record<string, unknown>> = {
	siteData: SiteData,
} & T;

declare type WebpackPlugins = NonNullable<Configuration["plugins"]>;

declare interface BuildStep<Data = unknown> {
	(src: string, dst: string, data: Data): WebpackPlugins | Promise<WebpackPlugins>,
}

export type PolicyBuildStep = BuildStep<PageBuildData<{
	policy: Policy,
}>>;
export type DirectoryBuildStep = BuildStep<PageBuildData<{
	directory: Record<string, Policy>,
}>>;
