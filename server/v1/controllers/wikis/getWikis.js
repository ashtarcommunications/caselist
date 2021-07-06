import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const getWikis = {
    GET: async (req, res) => {
        const sql = (SQL`
            SELECT * FROM wikis
        `);
        const wikis = await query(sql);

        return res.status(200).json(wikis);
    },
};

getWikis.GET.apiDoc = {
    summary: 'Returns list of wikis',
    operationId: 'getWikis',
    parameters: [
        {
            in: 'query',
            name: 'archived',
            description: 'Whether to return archived wikis',
            required: false,
            schema: { type: 'boolean' },
        },
    ],
    responses: {
        200: {
            description: 'Wikis',
            content: {
                '*/*': {
                    schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Wiki' },
                    },
                },
            },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
};

export default getWikis;
