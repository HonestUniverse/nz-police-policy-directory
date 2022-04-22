export type Policy = {
	title: string;
	type: string;
	files: PolicyFile[];
};

export type PolicyFile = {
	file: string;
	format: PolicyFormat;
	source: PolicySource;

	released: string;
	period: [string] | [string, string];

	notices?: Notice[];
};

export type PolicySource = {
	requester: string;
	name?: string;
	url?: string;
};

export type Notice = {
	type: 'Warning' | 'Information' | 'Error';
	message: string;
};

export type PolicyType = 'Police Instructions' | 'Police Manual' | 'Other/Unknown';

export type PolicyFormat = 'PDF (Text)' | 'PDF (Mixed)' | 'PDF (Image)';
