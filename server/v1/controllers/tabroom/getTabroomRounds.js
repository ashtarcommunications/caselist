const getTabroomRounds = {
    GET: async (req, res) => {
        const rounds = [
            { id: 1, round: '2' },
        ];

        return res.status(200).json(rounds);
    },
};

getTabroomRounds.GET.apiDoc = {
    summary: 'Returns list of rounds linked to a user on Tabroom',
    operationId: 'getTabroomRounds',
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
