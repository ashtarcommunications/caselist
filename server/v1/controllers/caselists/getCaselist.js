import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const getCaselist = {
    GET: async (req, res) => {
        const sql = (SQL`
            SELECT * FROM caselists C
            wHERE C.slug = ${req.params.caselist}
        `);
        const [caselist] = await query(sql);

        return res.status(200).json(caselist);
    },
};

getCaselist.GET.apiDoc = {
    summary: 'Returns a school',
    operationId: 'getSchool',
    parameters: [
        {
            in: 'path',
            name: 'caselist',
            description: 'Which caselist to return',
            required: true,
            schema: { type: 'string' },
        },
    ],
    responses: {
        200: {
            description: 'Caselist',
            content: { '*/*': { schema: { $ref: '#/components/schemas/Caselist' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
};

export default getCaselist;
