import config from '../../../config';
import { debugLogger } from '../../helpers/logger';

const getTabroomTeams = {
    GET: async (req, res) => {
        let url = `${config.TABROOM_API_URL}`;
        url += `/caselist/teams?person_id=${req.user_id}`;
        url += `&caselist_key=${config.TABROOM_CASELIST_KEY}`;

        let teams = [];
        try {
            const response = await fetch(url);
            teams = await response.json();
        } catch (err) {
            debugLogger.error('Failed to retrieve Tabroom teams');
            teams = [];
        }

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
                        items: { $ref: '#/components/schemas/Team' },
                    },
                },
            },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
};

export default getTabroomTeams;
