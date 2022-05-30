import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const getCaselists = {
    GET: async (req, res) => {
        let sql;
        if (req.query.archived) {
            sql = (SQL`SELECT * FROM caselists`);
        } else {
            sql = (SQL`SELECT * FROM caselists WHERE archived = 0`);
        }

        const caselists = await query(sql);
        caselists.forEach(c => {
            c.archived = c.archived === 1;
        });

        return res.status(200).json(caselists);
    },
};

getCaselists.GET.apiDoc = {
    summary: 'Returns list of caselists',
    operationId: 'getCaselists',
    parameters: [
        {
            in: 'query',
            name: 'archived',
            description: 'Whether to return archived caselists',
            required: false,
            schema: { type: 'boolean' },
        },
    ],
    responses: {
        200: {
            description: 'Caselists',
            content: {
                '*/*': {
                    schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Caselist' },
                    },
                },
            },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default getCaselists;
