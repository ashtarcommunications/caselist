import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const getSchool = {
    GET: async (req, res) => {
        const sql = (SQL`
            SELECT
                C.archived,
                S.*,
                U.display_name AS 'updated_by'
            FROM schools S
            INNER JOIN caselists C ON S.caselist_id = C.caselist_id
            LEFT JOIN users U ON U.user_id = S.updated_by_id
            wHERE C.slug = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
        `);
        const [school] = await query(sql);
        if (!school) { return res.status(404).json({ message: 'School not found' }); }

        if (school.archived) {
            delete school.updated_by;
        }

        return res.status(200).json(school);
    },
};

getSchool.GET.apiDoc = {
    summary: 'Returns a school',
    operationId: 'getSchool',
    parameters: [
        {
            in: 'path',
            name: 'caselist',
            description: 'Which caselist to return school in',
            required: true,
            schema: { type: 'string' },
        },
        {
            in: 'path',
            name: 'school',
            description: 'Which school to return',
            required: true,
            schema: { type: 'string' },
        },
    ],
    responses: {
        200: {
            description: 'School',
            content: { '*/*': { schema: { $ref: '#/components/schemas/School' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
};

export default getSchool;
