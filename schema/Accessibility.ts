import { AccessibilityFeature } from './AccessibilityFeature.js';

export enum AccessibilityRating {
	PASS = 'Pass',
	PARTIAL = 'Partial',
	FAIL = 'Fail',
	UNDETERMINED = 'Undetermined',
}

export type Accessibility = {
	rating: AccessibilityRating,

	features: {
		'text-based'?: AccessibilityFeature,
		semantics?: AccessibilityFeature,
		'alt text'?: AccessibilityFeature,
		unwatermarked?: AccessibilityFeature,
	},
};
