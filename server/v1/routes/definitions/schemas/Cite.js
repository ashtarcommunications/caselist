const Cite = {
    type: 'object',
    required: ['round_id'],
    properties: {
        cite_id: { type: 'integer' },
        round_id: { type: 'integer' },
        title: { type: 'string' },
        cites: { type: 'string' },
    },
};

export default Cite;
