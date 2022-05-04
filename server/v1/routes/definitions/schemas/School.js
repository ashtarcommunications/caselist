const School = {
    type: 'object',
    required: ['display_name'],
    properties: {
        name: { type: 'string' },
        display_name: { type: 'string' },
        state: { type: 'string', minLength: 2, maxLength: 2 },
    },
};

export default School;
