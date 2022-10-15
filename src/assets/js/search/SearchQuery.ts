export interface SearchQuery {
	name: string;
	type: string;
	includeStubs: boolean;
}

enum InputName {
	NAME = 'name',
	TYPE = 'type',
	INCLUDE_STUBS = 'include-stubs',
}

const defaultQuery: SearchQuery = {
	name: '',
	type: '',
	includeStubs: true,
};

/**
 * Build a `SearchQuery` based on a `FormData` object
 */
export function getSearchQueryFromFormData(data: FormData): SearchQuery {
	let name = data.get(InputName.NAME) ?? defaultQuery.name;
	if (name instanceof File) {
		name = defaultQuery.name;
	}

	let type = data.get(InputName.TYPE) ?? defaultQuery.type;
	if (type instanceof File) {
		type = defaultQuery.type;
	}

	const includeStubsEntry = data.get(InputName.INCLUDE_STUBS);
	// `FormData` encodes checkboxes as `'true'` or `null`
	const includeStubs = includeStubsEntry === String(true) ? true :
		includeStubsEntry === null ? false :
			defaultQuery.includeStubs;

	const searchQuery: SearchQuery = {
		name,
		type,
		includeStubs,
	};

	return searchQuery;
}

/**
 * Build a set of `URLSearchParams` based on a `SearchQuery`
 */
export function getUrlParamsFromSearchQuery(query: SearchQuery): URLSearchParams {
	const {
		name,
		type,
		includeStubs,
	} = query;

	const params = new URLSearchParams();

	if (name !== defaultQuery.name) {
		params.set(InputName.NAME, name);
	}

	if (type !== defaultQuery.type) {
		params.set(InputName.TYPE, type);
	}

	if (includeStubs !== defaultQuery.includeStubs) {
		params.set(InputName.INCLUDE_STUBS, String(includeStubs));
	}

	return params;
}

/**
 * Compare if two `SearchQuery` objects are the same
 */
export function compareSearchQuery(queryA: SearchQuery, queryB: SearchQuery): boolean {
	return JSON.stringify(queryA) === JSON.stringify(queryB);
}
