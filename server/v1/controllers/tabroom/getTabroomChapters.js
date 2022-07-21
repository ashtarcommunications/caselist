import crypto from 'crypto';
import config from '../../../config';
import { debugLogger } from '../../helpers/logger';

const getTabroomChapters = {
    GET: async (req, res) => {
        const hash = crypto.createHash('sha256').update(config.TABROOM_CASELIST_KEY).digest('hex');
        let url = `${config.TABROOM_API_URL}`;
        url += `/caselist/chapters?person_id=${req.user_id}`;
        url += `&caselist_key=${hash}`;

        let chapters = [];
        try {
            const response = await fetch(url);
            chapters = await response.json();
            if (!Array.isArray(chapters)) { chapters = []; }
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
    security: [{ cookie: [] }],
};

export default getTabroomChapters;
