export enum AccessibilityFeatureString {
	PARTIAL = 'Partial',
	UNKNOWN = 'Unknown',
}

export type AccessibilityFeature = {
	value: boolean | AccessibilityFeatureString,
	notes?: string[],
}
