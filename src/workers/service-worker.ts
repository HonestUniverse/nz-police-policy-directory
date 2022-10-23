/// <reference lib="WebWorker" />
// TODO: I'm not sure why VS Code breaks without that triple slash directive.
// The `tsconfig.workers.json` file already specifies the `WebWorker` lib,
// and the project can compile just fine. But VS Code doesn't seem to understand

// TypeScript doesn't have a Service Worker specific library.
// This declaration is necessary to update the types of `self`
// to match the expected environment for a service worker
// https://stackoverflow.com/questions/56356655/structuring-a-typescript-project-with-workers/56374158#56374158
declare const self: ServiceWorkerGlobalScope;
export {};

/** The name of the current version of the cache being used */
const cacheName = 'v1';

/**
 * Alias for `caches.delete`, used with `Array.prototype.map`
 */
async function deleteCache(key: string): Promise<boolean> {
	return await caches.delete(key);
}

/**
 * Delete all caches that we don't want to keep
 */
async function deleteOldCaches(): Promise<void> {
	const keys = await caches.keys();
	const cachesToKeep = [cacheName];
	const cachesToDelete = keys.filter((key) => cachesToKeep.includes(key) === false);

	await Promise.all(cachesToDelete.map(deleteCache));
}

/**
 * Cache a network response for a particular request
 */
async function addToCache(request: Request, response: Response): Promise<void> {
	const cache = await caches.open(cacheName);
	await cache.put(request, response);
}

async function getCachedResponse(request: Request): Promise<Response | undefined> {
	const cache = await caches.open(cacheName);
	const cacheResponse = await cache.match(request);
	return cacheResponse;
}

/**
 * Determine whether or not a resource should be able to be served from the Service Worker's cache
 */
function shouldCache(request: Request): boolean {
	let shouldCache = false;

	const cachePatterns: (string | RegExp)[] = [
		`/favicon.ico`,
		/^\/assets\//,
	];

	const url = new URL(request.url);
	const path = url.pathname;
	for (const pattern of cachePatterns) {
		if (typeof pattern === 'string') {
			if (path === pattern) {
				shouldCache = true;
				break;
			}
		} else {
			if (pattern.test(path)) {
				shouldCache = true;
				break;
			}
		}
	}

	return shouldCache;
}

/**
 * Try to fall back to a cached response if the network response fails
 */
async function networkFirst(request: Request): Promise<Response> {
	const shouldBeCached = shouldCache(request);

	try {
		const networkResponse = await fetch(request);

		if (networkResponse.ok) {
			if (shouldBeCached) {
				// TODO: Because we're using a cache-busting string, many assets' filenames change from deploy to deploy. Should we be doing cleanup here?
				addToCache(request, networkResponse.clone());
			}
			return networkResponse;
		} else {
			// If the request should be in the cache, try to return a cached response
			if (shouldBeCached) {
				const cachedResponse = await getCachedResponse(request);
				if (cachedResponse) {
					return cachedResponse;
				}
			}

			// If we don't have a cached response, return back to the network response
			return networkResponse;
		}
	} catch (error) {
		// `fetch` can throw an error if there was a network error

		// If the request should be in the cache, try to return a cached response
		if (shouldBeCached) {
			const cachedResponse = await getCachedResponse(request);
			if (cachedResponse) {
				return cachedResponse;
			}
		}

		// TODO: Show a custom error page instead for relevant requests, if possible?

		// If we don't have a cached response, return a generic network error
		const message = error instanceof Error ? error.message : 'Network error';
		return new Response(message, {
			status: 408, // REQUEST_TIMEOUT
			headers: {
				'Content-Type': 'text/plain',
			},
		});
	}
}

self.addEventListener('install', (event) => {
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(Promise.all([
		deleteOldCaches(),
		self.clients.claim(),
	]));
});

self.addEventListener('fetch', (event) => {
	event.respondWith(networkFirst(event.request));
});
