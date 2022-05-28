import config from '../../../config';
import { debugLogger } from '../../helpers/logger';

const getTabroomChapters = {
    GET: async (req, res) => {
        let url = `${config.TABROOM_API_URL}`;
        url += `/caselist/chapters?person_id=${req.user_id}`;
        url += `&caselist_key=${config.TABROOM_CASELIST_KEY}`;

        let chapters = [];
        try {
            const response = await fetch(url);
            chapters = await response.json();
        } catch (err) {
            debugLogger.error('Failed to retrieve Tabroom chapters');
            chapters = [];
        }

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
                        items: { $ref: '#/components/schemas/TabroomChapter' },
                    },
                },
            },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
};

export default getTabroomChapters;
