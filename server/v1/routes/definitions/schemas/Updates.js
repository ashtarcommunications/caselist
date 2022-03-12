const Updates = {
    type: 'array',
    items: {
        $ref: '#/components/schemas/Update',
    },
    minItems: 1,
};

export default Updates;
