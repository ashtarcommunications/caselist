import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const deleteCite = {
    DELETE: async (req, res) => {
        await query(SQL`
            UPDATE cites SET deleted = 1 WHERE cite_id = ${req.params.cite}
        `);

        return res.status(201).json({ message: 'Cite successfully deleted' });
    },
};

deleteCite.DELETE.apiDoc = {
    summary: 'Deletes a cite',
    operationId: 'deleteCite',
    parameters: [
        {
            in: 'path',
            name: 'caselist',
            description: 'Caselist',
            required: true,
            schema: { type: 'string' },
        },
        {
            in: 'path',
            name: 'school',
            description: 'School',
            required: true,
            schema: { type: 'string' },
        },
        {
            in: 'path',
            name: 'team',
            description: 'Team',
            required: true,
            schema: { type: 'string' },
        },
        {
            in: 'path',
            name: 'cite',
            description: 'Cite',
            required: true,
            schema: { type: 'integer' },
        },
    ],
    responses: {
        201: {
            description: 'Deleted cite',
            content: { '*/*': { schema: { $ref: '#/components/schemas/Cite' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default deleteCite;
