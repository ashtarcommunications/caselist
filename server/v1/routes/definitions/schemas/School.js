const School = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        state: { type: 'string', minLength: 2, maxLength: 2 },
    },
};

export default School;
