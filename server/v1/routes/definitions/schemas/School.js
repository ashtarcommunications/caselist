const School = {
    type: 'object',
    required: ['displayName'],
    properties: {
        name: { type: 'string' },
        displayName: { type: 'string' },
        state: { type: 'string', minLength: 2, maxLength: 2 },
    },
};

export default School;
