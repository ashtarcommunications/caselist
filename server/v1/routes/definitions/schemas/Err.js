const Err = {
    type: 'object',
    properties: {
        message: {
            description: 'Error message',
            type: 'string',
        },
    },
    required: ['message'],
};

export default Err;
