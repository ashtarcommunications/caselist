const getTabroomTeams = {
    GET: async (req, res) => {
        const teams = [
            { id: 1, name: 'Northwestern XX' },
        ];

        return res.status(200).json(teams);
    },
};

getTabroomTeams.GET.apiDoc = {
    summary: 'Returns list of teams linked to a user on Tabroom',
    operationId: 'getTabroomTeams',
    responses: {
        200: {
            description: 'Teams',
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

export default getTabroomTeams;
