const Cite = {
    type: 'object',
    properties: {
        cite_id: { type: 'integer' },
        round_id: { type: 'integer' },
        title: { type: 'string' },
        cites: { type: 'string' },
        deleted: { type: 'boolean' },
    },
};

export default Cite;
