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

interface CacheAction {
	/** A cache busting string for a set of assets to be cleared from a Service Worker cache */
	clear?: string,
	add: boolean,
}

/** The name of the current version of the cache being used */
const cacheName = 'v2';

const networkErrorPath = '/408.html';

/** This `Set` is used to prevent the same sets of assets from being cleared from the cache multiple times */
const clearedCacheBustingStrings = new Set<string>();

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
 * Clears all assets in the current cache that contain a given cache busting string.
 */
async function clearCacheBatch(cacheBustingString: string): Promise<void> {
	if (clearedCacheBustingStrings.has(cacheBustingString)) {
		return;
	}
	clearedCacheBustingStrings.add(cacheBustingString);

	const cache = await caches.open(cacheName);
	const keys = await cache.keys();

	// Do a `map` with `Promise.all` and then a `filter` in order to filter by an asynchronous function
	const filterResults = await Promise.all(keys.map(async (req) => {
		// Find all items with a cache busting string that isn't the current one
		const reqCacheBustingString = await getCacheBustingString(req);
		const shouldRemove = Boolean(
			reqCacheBustingString &&
			reqCacheBustingString !== cacheBustingString
		);
		return shouldRemove;
	}));
	const cachesToClear = keys.filter((req, i) => filterResults[i]);

	await Promise.all(cachesToClear.map((req) => removeFromCache(req, cache)));
}

/**
 * Cache a network response for a particular request
 */
async function addToCache(request: Request, response: Response): Promise<void>
async function addToCache(assetPath: string | string[]): Promise<void>
async function addToCache(request: RequestInfo | RequestInfo[], response?: Response): Promise<void> {
	const cache = await caches.open(cacheName);

	if (Array.isArray(request)) {
		await cache.addAll(request);
	} else if (response) {
		await cache.put(request, response);
	} else {
		await cache.add(request);
	}
}

/**
 * Remove a network response from the cache
 */
async function removeFromCache(request: RequestInfo, cache?: Cache): Promise<void> {
	cache = cache || await caches.open(cacheName);
	await cache.delete(request);
}

/**
 * Retrieve a cached `Response` for a given `Request` from the cache
 */
async function getCachedResponse(request: Request): Promise<Response | undefined> {
	const cache = await caches.open(cacheName);
	const cacheResponse = await cache.match(request);
	return cacheResponse;
}

/**
 * We apply a cache busting string to many assets. This function looks in the cache for
 * assets with this string and, if it finds one, returns it.
 *
 * @param {Request} [req] - If specified, determines the cache busting string for a specific request. Otherwise, finds the first one in the current cache.
 */
async function getCacheBustingString(req?: Request): Promise<string | null> {
	let paths: string[];

	if (req) {
		paths = [new URL(req.url).pathname];
	} else {
		const cache = await caches.open(cacheName);
		const keys = await cache.keys();
		// Important to reverse this array so more recently cached items appear first
		paths = keys.map((req) => new URL(req.url).pathname).reverse();
	}

	const cacheBustingString = paths.map((path) => {
		const cacheBustingString = path.match(/.+(\.v-[^.]+\.)/)?.[1] ?? null;

		return cacheBustingString;
	}).find(Boolean) ?? null;

	return cacheBustingString;
}

/**
 * Determine what action to take with the Service Worker's cache when faced with a given `Request`
 */
async function determineCacheAction(request: Request): Promise<CacheAction> {
	let cacheBustingStringToClear: string | undefined;
	let shouldAddToCache = false;

	const cachePatterns: (string | RegExp)[] = [
		`/favicon.ico`,
		`/search.json`,
		/^\/assets\//,
	];

	const url = new URL(request.url);
	const path = url.pathname;
	for (const pattern of cachePatterns) {
		if (typeof pattern === 'string') {
			if (path === pattern) {
				shouldAddToCache = true;
				break;
			}
		} else {
			if (pattern.test(path)) {
				shouldAddToCache = true;

				// Because we're using a cache-busting string, many assets' filenames change
				// from deploy to deploy. So we may need to clear them from the cache
				const currentCacheBustingString = await getCacheBustingString();
				const reqCacheBustingString = await getCacheBustingString(request);
				if (currentCacheBustingString && reqCacheBustingString) {
					if (currentCacheBustingString !== reqCacheBustingString) {
						cacheBustingStringToClear = reqCacheBustingString;
					}
				}

				break;
			}
		}
	}

	const cacheAction: CacheAction = {
		clear: cacheBustingStringToClear,
		add: shouldAddToCache,
	};
	return cacheAction;
}

/**
 * Try to fall back to a cached response if the network response fails
 */
async function networkFirst(request: Request): Promise<Response> {
	const cacheAction = await determineCacheAction(request);

	try {
		const networkResponse = await fetch(request);

		if (networkResponse.ok) {
			// Kick off cache actions, but don't wait for them to complete before returning a response
			if (cacheAction.clear) {
				clearCacheBatch(cacheAction.clear);
			}

			if (cacheAction.add) {
				addToCache(request, networkResponse.clone());
			}

			return networkResponse;
		} else {
			// If the request should be in the cache, try to return a cached response
			if (cacheAction.add) {
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
		if (cacheAction.add) {
			const cachedResponse = await getCachedResponse(request);
			if (cachedResponse) {
				return cachedResponse;
			}
		}

		// If the request is for a page, and we don't have a cached response, try to return the generic network error page
		if (request.destination === 'document') {
			const fallbackPage = await caches.match(networkErrorPath);
			if (fallbackPage) {
				return fallbackPage;
			}
		}

		// Otherwise, return a generic network error in plain text instead
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
	event.waitUntil(
		// Necessary assets to display the network error page are cached when
		// any page is loaded once the service worker is installed
		addToCache(networkErrorPath),
	);

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
