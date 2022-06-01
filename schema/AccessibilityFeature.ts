export enum AccessibilityFeatureString {
	PARTIAL = 'Partial',
	UNDETERMINED = 'Undetermined',
}

export type AccessibilityFeature = {
	value: boolean | AccessibilityFeatureString,
	notes?: string[],
}
