import { File } from './File.js';

/**
 * Utility type for creating a modified type where any specified properties are required.
 */
type WithRequiredProperty<Base, Prop extends keyof Base> = Base & { [P in Prop]-?: Base[P] }

/**
 * A modified file, intended to serve as an alternative to an original file. Several properties are inherited from the original file so not required on this type.
 */
export type AlternateFile = Omit<
	WithRequiredProperty<File, 'modifications'>,
	'provenance' |
	'licence' |
	'original' |
	'incomplete' |
	'alternateFiles'
>;
