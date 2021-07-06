const Caselist = {
    type: 'object',
    properties: {
        caselist_id: { type: 'integer', minimum: 1 },
        slug: { type: 'string' },
        name: { type: 'string' },
        year: { type: 'integer' },
    },
};

export default Caselist;
