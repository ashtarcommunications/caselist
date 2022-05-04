import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const getCites = {
    GET: async (req, res) => {
        let sql = (SQL`
            SELECT
                CT.*,
                R.side,
                R.tournament,
                R.round,
                R.opponent,
                R.judge
            FROM cites CT
            INNER JOIN rounds R ON R.round_id = CT.round_id
            INNER JOIN teams T ON T.team_id = R.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON S.caselist_id = C.caselist_id
            wHERE C.name = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            AND LOWER(T.name = ${req.params.team})
            AND CT.deleted <> 1
        `);
        if (req.params.side) {
            sql += SQL`AND LOWER(R.side) = LOWER(${req.params.side})`;
        }
        const cites = await query(sql);

        return res.status(200).json(cites);
    },
};

getCites.GET.apiDoc = {
    summary: 'Returns list of cites for a team',
    operationId: 'getCites',
    parameters: [
        {
            in: 'path',
            name: 'caselist',
            description: 'Which caselist to return schools in',
            required: true,
            schema: { type: 'string' },
        },
        {
            in: 'path',
            name: 'school',
            description: 'Which school to return teams in',
            required: true,
            schema: { type: 'string' },
        },
        {
            in: 'path',
            name: 'team',
            description: 'Which team to return cites in',
            required: true,
            schema: { type: 'string' },
        },
        {
            in: 'query',
            name: 'side',
            description: 'Which side to return cites for',
            required: false,
            schema: { type: 'string' },
        },
    ],
    responses: {
        200: {
            description: 'Cites',
            content: {
                '*/*': {
                    schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Cite' },
                    },
                },
            },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default getCites;
