const SearchResult = {
    type: 'object',
    properties: {
        id: { type: 'integer', minimum: 1 },
        content: { type: 'string' },
    },
};

export default SearchResult;
