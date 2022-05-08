import log from '../log/insertEventLog';

const postTabroomTeamLink = {
    POST: async (req, res) => {
        await log({
            user_id: req.user_id,
            tag: 'tabroom-add',
            description: `Linked to tabroom`,
        });

        return res.status(201).json({ message: 'Team linked to Tabroom' });
    },
};

postTabroomTeamLink.POST.apiDoc = {
    summary: 'Creates a tabroom team link',
    operationId: 'postTabroomTeamLink',
    requestBody: {
        description: 'The link to create',
        required: true,
        content: { '*/*': { schema: { $ref: '#/components/schemas/School' } } },
    },
    responses: {
        201: {
            description: 'Created link',
            content: { '*/*': { schema: { $ref: '#/components/schemas/School' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default postTabroomTeamLink;
