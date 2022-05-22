/**
 * Create a debounced version of a function that will only be executed after it hasn't been called for a certain period.
 *
 * @param {Function} fn - The function to debounce
 * @param {number} delay - The duration to wait before executing the function (ms)
 */
export function debounce<F extends (...args: any) => any>(fn: F, delay: number) {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
		if (timeout) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(() => {
			fn.apply(this, args);
		}, delay);
	}
}
