import { AccessibilityFeature } from './AccessibilityFeature.js';

export enum AccessibilityRating {
	GOOD = 'Good',
	OKAY = 'Okay',
	POOR = 'Poor',
	BAD = 'Bad',
	UNDETERMINED = 'Undetermined',
}

export type Accessibility = {
	rating?: AccessibilityRating,

	'text-based': AccessibilityFeature,
	semantics: AccessibilityFeature,
	'alt text': AccessibilityFeature,
	unwatermarked: AccessibilityFeature,
};
