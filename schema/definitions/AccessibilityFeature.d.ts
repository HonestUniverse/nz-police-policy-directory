declare enum AccessibilityFeatureString {
	PARTIAL = 'Partial',
	UNKNOWN = 'Unknown',
}

export type AccessibilityFeature = {
	value: boolean | AccessibilityFeatureString,
	note?: string,
}
