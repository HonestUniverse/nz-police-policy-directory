import { AccessibilityFeature } from './AccessibilityFeature.js';

export type Accessibility = {
	'text-based': AccessibilityFeature,
	semantics: AccessibilityFeature,
	'alt text': AccessibilityFeature,
	unwatermarked: AccessibilityFeature,
};
