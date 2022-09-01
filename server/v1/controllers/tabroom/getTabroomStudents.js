import crypto from 'crypto';
import { fetch } from '@speechanddebate/nsda-js-utils';
import config from '../../../config';
import { debugLogger } from '../../helpers/logger';

const getTabroomStudents = {
    GET: async (req, res) => {
        const hash = crypto.createHash('sha256').update(config.TABROOM_CASELIST_KEY).digest('hex');
        let url = `${config.TABROOM_API_URL}`;
        url += `/caselist/students?person_id=${req.user_id}`;
        url += `&caselist_key=${hash}`;

        let students = [];
        try {
            const response = await fetch(url);
            students = await response.json();
            if (!Array.isArray(students)) { students = []; }
        } catch (err) {
            debugLogger.error('Failed to retrieve Tabroom students');
            students = [];
        }

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
                        items: { $ref: '#/components/schemas/TabroomStudent' },
                    },
                },
            },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default getTabroomStudents;
