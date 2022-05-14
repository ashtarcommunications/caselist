const getTabroomRounds = {
    GET: async (req, res) => {
        const rounds = [
            { id: 1, tournament: 'Lexington', round: '1', side: 'A', opponent: 'Evil Empire XX', judge: 'Hardy' },
            { id: 2, tournament: 'Lexington', round: '2', side: 'N', opponent: 'Evil Empire YY', judge: 'Palmer' },
        ];

        return res.status(200).json(rounds);
    },
};

getTabroomRounds.GET.apiDoc = {
    summary: 'Returns list of rounds linked to a user on Tabroom',
    operationId: 'getTabroomRounds',
    parameters: [
        {
            in: 'query',
            name: 'slug',
            description: 'Slug of page to match rounds',
            required: true,
            schema: {
                type: 'string',
            },
        },
    ],
    responses: {
        200: {
            description: 'Rounds',
            content: {
                '*/*': {
                    schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/School' },
                    },
                },
            },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
};

export default getTabroomRounds;
