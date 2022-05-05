import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const getRecent = {
    GET: async (req, res) => {
        const sql = (SQL`
            SELECT DISTINCT R.team_id, T.name, T.code FROM
            ROUNDS R
            INNER JOIN teams T ON T.team_id = R.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            wHERE C.name = ${req.params.caselist}
            AND (R.deleted IS NULL OR R.deleted <> 1)
            ORDER BY R.updated_at DESC
            LIMIT 10
        `);
        const recent = await query(sql);

        return res.status(200).json(recent);
    },
};

getRecent.GET.apiDoc = {
    summary: 'Returns recent modifications in a caselist',
    operationId: 'getRecent',
    parameters: [
        {
            in: 'path',
            name: 'caselist',
            description: 'Which caselist to get modifications for',
            required: true,
            schema: { type: 'string' },
        },
    ],
    responses: {
        200: {
            description: 'Recent rounds',
            content: { '*/*': { schema: { $ref: '#/components/schemas/Recent' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
};

export default getRecent;
