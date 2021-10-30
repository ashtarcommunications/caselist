import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const getTeam = {
    GET: async (req, res) => {
        const sql = (SQL`
            SELECT T.* FROM teams T
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON S.caselist_id = C.caselist_id
            wHERE C.slug = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            AND LOWER(T.code) = LOWER(${req.params.team})
        `);
        const [team] = await query(sql);

        return res.status(200).json(team);
    },
};

getTeam.GET.apiDoc = {
    summary: 'Returns a single team',
    operationId: 'getTeam',
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
            description: 'Which school team belongs to',
            required: true,
            schema: { type: 'string' },
        },
        {
            in: 'path',
            name: 'team',
            description: 'Which team to return',
            required: true,
            schema: { type: 'string' },
        },
    ],
    responses: {
        200: {
            description: 'Team',
            content: { '*/*': { schema: { $ref: '#/components/schemas/Team' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
};

export default getTeam;
