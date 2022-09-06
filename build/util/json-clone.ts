/**
 * Create a deep copy of an object that can be converted to JSON.
 */
export function jsonClone<T extends object>(obj: T): T {
	return JSON.parse(JSON.stringify(obj)) as T;
}
