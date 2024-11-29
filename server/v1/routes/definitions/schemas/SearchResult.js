const SearchResult = {
	type: 'object',
	properties: {
		id: { type: 'integer', minimum: 1 },
		shard: { type: 'string' },
		content: { type: 'string' },
		path: { type: 'string' },
	},
};

export default SearchResult;
