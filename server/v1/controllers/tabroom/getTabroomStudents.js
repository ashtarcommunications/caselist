import { fetch } from '@speechanddebate/nsda-js-utils';
import config from '../../../config';
import { debugLogger } from '../../helpers/logger';

const getTabroomStudents = {
    GET: async (req, res) => {
        let url = `${config.TABROOM_API_URL}`;
        url += `/caselist/students?person_id=${req.user_id}`;

        const base64 = Buffer.from(`${config.TABROOM_API_USER_ID}:${config.TABROOM_API_KEY}`).toString('base64');

        let students = [];
        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Basic ${base64}`,
                },
            });
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
