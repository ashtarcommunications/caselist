import fetch from 'isomorphic-fetch';
import config from '../../../config';

const getTabroomChapters = {
    GET: async (req, res) => {
        const chapters = await fetch(`${config.TABROOM_API_URL}/caselist/chapters?person_id=${req.user.id}`);

        return res.status(200).json(chapters);
    },
};

getTabroomChapters.GET.apiDoc = {
    summary: 'Returns list of chapters linked to a user on Tabroom',
    operationId: 'getTabroomChapters',
    responses: {
        200: {
            description: 'Chapters',
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

export default getTabroomChapters;
