const getTabroomStudents = {
    GET: async (req, res) => {
        const students = [
            { id: 1, first: 'Aaron', last: 'Hardy', name: 'Aaron Hardy' },
            { id: 2, first: 'Chris', last: 'Palmer', name: 'Chris Palmer' },
        ];

        return res.status(200).json(students);
    },
};

getTabroomStudents.GET.apiDoc = {
    summary: 'Returns list of students linked to a user on Tabroom',
    operationId: 'getTabroomStudents',
    responses: {
        200: {
            description: 'Students',
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

export default getTabroomStudents;
