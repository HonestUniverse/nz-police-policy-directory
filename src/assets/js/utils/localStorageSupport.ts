/**
 * Whether or not the current browser supports the `localStorage` API.
 */
export const localStorageSupport = (() => {
	const testKey = 'localStorage support test';

	try {
		localStorage.setItem(testKey, 'true');
		localStorage.getItem(testKey);
		localStorage.removeItem(testKey);
		return true;
	} catch (e) {
		return false;
	}
})();
