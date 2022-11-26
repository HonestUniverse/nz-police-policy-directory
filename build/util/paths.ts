/**
 * This file contains utility path constants for use in other build files,
 * so if directories are rearranged these can all be changed in one place.
 */

import path from 'path';
import { fileURLToPath } from 'url';

/** Used to convert root-relative paths to file-relative paths, for file-relative dynamic imports */
export const root = '../';

export const src = './src';
export const policies = `${src}/policies`;
export const testPolicies = `${src}/test-policies`;
export const templates = `${src}/templates`;
export const assets = `${src}/assets`;
export const workers = `${src}/workers`;

export const policiesDst = `./policies`;
export const aboutDst = `./about`;
export const howToUseDst = './how-to-use';
export const accessibilityDst = './accessibility';
export const contributingDst = './contributing';

export const schema = `./schema`;

const buildFull = path.resolve(fileURLToPath(import.meta.url), '../../');
export const srcFull = path.resolve(buildFull, '../src');
export const assetsFull = path.resolve(srcFull, './assets');
export const sharedFull = path.resolve(srcFull, './shared');
export const workersFull = path.resolve(srcFull, './workers');

export const schemaFull = path.resolve(buildFull, '../schema');

export const distFull = path.resolve(buildFull, '../dist');
export const distAssetsFull = path.resolve(buildFull, '../dist/assets');
