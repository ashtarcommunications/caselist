const Recent = {
    type: 'object',
    properties: {
        team_id: { type: 'integer', minimum: 1 },
        name: { type: 'string' },
        code: { type: 'string' },
    },
};

export default Recent;
