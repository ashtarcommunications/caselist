const Team = {
    type: 'object',
    required: ['display_name'],
    properties: {
        name: { type: 'string' },
        display_name: { type: 'string' },
        debater1_first: { type: 'string' },
        debater1_last: { type: 'string' },
        debater2_first: { type: 'string' },
        debater2_last: { type: 'string' },
    },
};

export default Team;
