import { DatePartial } from './DatePartial.js';

export type PolicyVersionDuration = {
	start?: DatePartial,
	end?: DatePartial,
	ended?: true,
	on?: DatePartial[],
};
