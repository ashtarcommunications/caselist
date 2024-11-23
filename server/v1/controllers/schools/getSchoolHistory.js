import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const getSchoolHistory = {
    GET: async (req, res) => {
        const sql = (SQL`
            SELECT
                TH.event,
                TH.name,
                TH.updated_at,
                U.display_name AS 'updated_by'
            FROM teams_history TH
            INNER JOIN teams T ON T.team_id = TH.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            INNER JOIN users U ON U.user_id = TH.updated_by_id
            WHERE C.name = ${req.params.caselist}
                AND S.name = ${req.params.school}
                AND C.archived = 0
            ORDER BY TH.updated_at DESC
        `);

        const result = await query(sql);

        const history = result.map((h) => {
            let description;
            switch (h.event) {
                case 'insert':
                    description = `Created team ${h.name}`;
                    break;
                case 'update':
                    description = `Updated team info for ${h.name}`;
                    break;
                case 'delete':
                    description = `Deleted team ${h.name}`;
                    break;
                default:
                    description = 'Unknown event';
            }

            return {
                description,
                updated_at: h.updated_at,
                updated_by: h.updated_by,
            };
        });

        return res.status(200).json(history);
    },
};

getSchoolHistory.GET.apiDoc = {
    summary: 'Returns the history log for a school',
    operationId: 'getSchoolHistory',
    parameters: [
        {
            in: 'path',
            name: 'caselist',
            description: 'Which caselist to return the log for',
            required: true,
            schema: { type: 'string' },
        },
        {
            in: 'path',
            name: 'school',
            description: 'Which school to return the log for',
            required: true,
            schema: { type: 'string' },
        },
    ],
    responses: {
        200: {
            description: 'History log',
            content: { '*/*': { schema: { $ref: '#/components/schemas/History' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default getSchoolHistory;
