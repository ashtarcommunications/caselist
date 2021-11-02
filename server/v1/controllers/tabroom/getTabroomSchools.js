// import config from '../../../config';

const getTabroomSchools = {
    GET: async (req, res) => {
        // const schools = await fetch(`${config.TABROOM_API_URL}/schools`);
        const schools = [
            { name: 'Test School', chapter_id: 1 },
        ];

        return res.status(200).json(schools);
    },
};

getTabroomSchools.GET.apiDoc = {
    summary: 'Returns list of schools linked to a user on Tabroom',
    operationId: 'getTabroomSchools',
    responses: {
        200: {
            description: 'Schools',
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

export default getTabroomSchools;
