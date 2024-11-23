import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql.js';

const getTeamHistory = {
    GET: async (req, res) => {
        let sql;

        sql = (SQL`
            SELECT
                RH.event,
                RH.updated_at,
                U.display_name AS 'updated_by'
            FROM rounds_history RH
            INNER JOIN teams T ON T.team_id = RH.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            INNER JOIN users U ON U.user_id = RH.updated_by_id
            WHERE C.name = ${req.params.caselist}
                AND S.name = ${req.params.school}
                AND T.name = ${req.params.team}
                AND C.archived = 0
            ORDER BY RH.created_at DESC
        `);

        const rounds = await query(sql);

        const roundsHistory = rounds.map((r) => {
            let description;
            switch (r.event) {
                case 'insert':
                    description = 'Created a round';
                    break;
                case 'update':
                    description = 'Updated a round';
                    break;
                case 'delete':
                    description = 'Deleted a round';
                    break;
                default:
                    description = 'Unknown event';
            }

            return {
                description,
                updated_at: r.updated_at,
                updated_by: r.updated_by,
            };
        });

        sql = (SQL`
            SELECT
                CH.event,
                CH.updated_at,
                U.display_name AS 'updated_by'
            FROM cites_history CH
            INNER JOIN rounds_history RH ON RH.round_id = CH.round_id
            INNER JOIN teams T ON T.team_id = RH.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            INNER JOIN users U ON U.user_id = RH.updated_by_id
            WHERE C.name = ${req.params.caselist}
                AND S.name = ${req.params.school}
                AND T.name = ${req.params.team}
                AND C.archived = 0
            GROUP BY CH.cite_id, CH.version
            ORDER BY RH.updated_at DESC
        `);

        const cites = await query(sql);

        const citesHistory = cites.map((c) => {
            let description;
            switch (c.event) {
                case 'insert':
                    description = 'Created a cite';
                    break;
                case 'update':
                    description = 'Updated a cite';
                    break;
                case 'delete':
                    description = 'Deleted a cite';
                    break;
                default:
                    description = 'Unknown event';
            }

            return {
                description,
                updated_at: c.updated_at,
                updated_by: c.updated_by,
            };
        });

        let history = [...roundsHistory, ...citesHistory];

        // Sort by created_at descending
        history = history.concat().sort((a, b) => {
            // eslint-disable-next-line no-nested-ternary
            return (a.updated_at > b.updated_at)
                ? 1
                : (
                    (b.updated_at > a.updated_at)
                    ? -1
                    : 0
                );
        });
        history = history.reverse();

        return res.status(200).json(history);
    },
};

getTeamHistory.GET.apiDoc = {
    summary: 'Returns the history log for a team',
    operationId: 'getTeamHistory',
    parameters: [
        {
            in: 'path',
            name: 'caselist',
            description: 'Which caselist to return the history for',
            required: true,
            schema: { type: 'string' },
        },
        {
            in: 'path',
            name: 'school',
            description: 'Which school to return the history for',
            required: true,
            schema: { type: 'string' },
        },
        {
            in: 'path',
            name: 'team',
            description: 'Which team to return the history for',
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

export default getTeamHistory;
