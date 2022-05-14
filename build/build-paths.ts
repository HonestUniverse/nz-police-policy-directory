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
export const schema = `./schema`;

const buildFull = path.resolve(fileURLToPath(import.meta.url), '../');
export const srcFull = path.resolve(buildFull, '../src');
export const assetsFull = `${srcFull}/assets`;
export const distFull = path.resolve(buildFull, '../dist');
