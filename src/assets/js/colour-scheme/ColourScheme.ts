export enum ColourScheme {
	DEFAULT = 'default',
	DARK = 'dark',
	LIGHT = 'light',
}

const colourSchemes = Object.freeze(Object.values(ColourScheme));

export function isColourScheme(val: unknown): val is ColourScheme {
	// Type assertion to `unknown[]` needed to allow use of `Array.prototype.includes`
	return (colourSchemes as unknown[]).includes(val);
}
