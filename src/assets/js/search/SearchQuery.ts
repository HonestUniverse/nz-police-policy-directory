export enum SearchQueryParam {
	NAME = 'name',
	TYPE = 'type',
	INCLUDE_STUBS = 'include-stubs',
}

export interface SearchQuery {
	[SearchQueryParam.NAME]: string;
	[SearchQueryParam.TYPE]: string;
	[SearchQueryParam.INCLUDE_STUBS]: boolean;
}

const defaultQuery: SearchQuery = {
	[SearchQueryParam.NAME]: '',
	[SearchQueryParam.TYPE]: '',
	[SearchQueryParam.INCLUDE_STUBS]: true,
};

/**
 * Build a `SearchQuery` based on a `FormData` object
 */
export function getSearchQueryFromFormData(data: FormData): SearchQuery {
	let name = data.get(SearchQueryParam.NAME) ?? defaultQuery[SearchQueryParam.NAME];
	if (name instanceof File) {
		name = defaultQuery[SearchQueryParam.NAME];
	}

	let type = data.get(SearchQueryParam.TYPE) ?? defaultQuery[SearchQueryParam.TYPE];
	if (type instanceof File) {
		type = defaultQuery[SearchQueryParam.TYPE];
	}

	const includeStubsEntry = data.get(SearchQueryParam.INCLUDE_STUBS);
	// `FormData` encodes checkboxes as `'true'` or `null`
	const includeStubs = includeStubsEntry === String(true) ? true :
		includeStubsEntry === null ? false :
			defaultQuery[SearchQueryParam.INCLUDE_STUBS];

	const searchQuery: SearchQuery = {
		[SearchQueryParam.NAME]: name,
		[SearchQueryParam.TYPE]: type,
		[SearchQueryParam.INCLUDE_STUBS]: includeStubs,
	};

	return searchQuery;
}

/**
 * Build a set of `URLSearchParams` based on a `SearchQuery`
 */
export function getUrlParamsFromSearchQuery(query: SearchQuery): URLSearchParams {
	const {
		[SearchQueryParam.NAME]: name,
		[SearchQueryParam.TYPE]: type,
		[SearchQueryParam.INCLUDE_STUBS]: includeStubs,
	} = query;

	const params = new URLSearchParams();

	if (name !== defaultQuery[SearchQueryParam.NAME]) {
		params.set(SearchQueryParam.NAME, name);
	}

	if (type !== defaultQuery[SearchQueryParam.TYPE]) {
		params.set(SearchQueryParam.TYPE, type);
	}

	if (includeStubs !== defaultQuery[SearchQueryParam.INCLUDE_STUBS]) {
		params.set(SearchQueryParam.INCLUDE_STUBS, String(includeStubs));
	}

	return params;
}

/**
 * Compare if two `SearchQuery` objects are the same
 */
export function compareSearchQuery(queryA: SearchQuery, queryB: SearchQuery): boolean {
	return JSON.stringify(queryA) === JSON.stringify(queryB);
}
