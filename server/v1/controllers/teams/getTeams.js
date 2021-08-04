import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const getTeams = {
    GET: async (req, res) => {
        const sql = (SQL`
            SELECT T.* FROM teams T
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON S.caselist_id = C.caselist_id
            wHERE C.slug = ${req.params.caselist}
            AND S.name = ${req.params.school}
        `);
        const teams = await query(sql);

        return res.status(200).json(teams);
    },
};

getTeams.GET.apiDoc = {
    summary: 'Returns list of teams in a school',
    operationId: 'getTeams',
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
    ],
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

export default getTeams;
