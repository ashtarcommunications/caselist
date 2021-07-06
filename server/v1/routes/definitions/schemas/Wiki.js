const Wiki = {
    type: 'object',
    properties: {
        wiki_id: { type: 'integer', minimum: 1 },
        slug: { type: 'string' },
        name: { type: 'string' },
        year: { type: 'integer' },
    },
};

export default Wiki;
