import { AccessibilityFeature } from './AccessibilityFeature.js';

export enum AccessibilityRating {
	GOOD = 'Good',
	POOR = 'Poor',
	BAD = 'Bad',
	NONE = 'None',
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
