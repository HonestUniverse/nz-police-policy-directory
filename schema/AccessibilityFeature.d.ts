declare enum AccessibilityFeatureString {
	PARTIAL = 'Partial',
	UNKNOWN = 'Unknown',
}

declare type AccessibilityFeatureValue = boolean | AccessibilityFeatureString;

export type AccessibilityFeature = AccessibilityFeatureValue | {
	value: AccessibilityFeatureValue,
	note?: string,
}
