import type { OIAWithholding } from './OIAWithholding.js';

export enum OIAWithholdingsSummary {
	NONE = 'None',
	UNDETERMINED = 'Undetermined',
}

export type OIAWithholdings = {
	'6(a)'?: OIAWithholding,
	'6(b)(i)'?: OIAWithholding,
	'6(b)(ii)'?: OIAWithholding,
	'6(c)'?: OIAWithholding,
	'6(d)'?: OIAWithholding,
	'6(e)(i)'?: OIAWithholding,
	'6(e)(ii)'?: OIAWithholding,
	'6(e)(iii)'?: OIAWithholding,
	'6(e)(iv)'?: OIAWithholding,
	'6(e)(v)'?: OIAWithholding,
	'6(e)(vi)'?: OIAWithholding,
	'9(2)(a)'?: OIAWithholding,
	'9(2)(b)(i)'?: OIAWithholding,
	'9(2)(b)(ii)'?: OIAWithholding,
	'9(2)(ba)(i)'?: OIAWithholding,
	'9(2)(ba)(ii)'?: OIAWithholding,
	'9(2)(c)'?: OIAWithholding,
	'9(2)(d)'?: OIAWithholding,
	'9(2)(e)'?: OIAWithholding,
	'9(2)(f)(i)'?: OIAWithholding,
	'9(2)(f)(ii)'?: OIAWithholding,
	'9(2)(f)(iii)'?: OIAWithholding,
	'9(2)(f)(iv)'?: OIAWithholding,
	'9(2)(g)(i)'?: OIAWithholding,
	'9(2)(g)(ii)'?: OIAWithholding,
	'9(2)(h)'?: OIAWithholding,
	'9(2)(i)'?: OIAWithholding,
	'9(2)(j)'?: OIAWithholding,
	'9(2)(k)'?: OIAWithholding,
	'Out of scope'?: OIAWithholding,
} | OIAWithholdingsSummary;
