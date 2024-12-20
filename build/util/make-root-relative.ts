import path from 'path';

/**
 * Turn a relative path into a root-relative path
 */
export function makeRootRelative(relativePath: string): string {
	// Create a relative path from the root to the current directory
	const systemRel = path.relative('.', relativePath);
	// Path may use "\" depending on the system it ran on, replace with web-safe "/"
	const webRel = systemRel.replace(/\\/g, '/');
	// Make root-relative
	const webRootRel = `/${webRel}`;

	return webRootRel;
}
