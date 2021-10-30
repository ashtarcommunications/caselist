import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const deleteRound = {
    DELETE: async (req, res) => {
        await query(SQL`
            UPDATE cites SET deleted = 1 WHERE round_id = ${req.params.round}
        `);
        await query(SQL`
            UPDATE rounds SET deleted = 1 WHERE round_id = ${req.params.round}
        `);

        return res.status(201).json({ message: 'Round successfully deleted' });
    },
};

deleteRound.DELETE.apiDoc = {
    summary: 'Deletes a round',
    operationId: 'deleteRound',
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
            name: 'round',
            description: 'Round',
            required: true,
            schema: { type: 'integer' },
        },
    ],
    responses: {
        201: {
            description: 'Deleted round',
            content: { '*/*': { schema: { $ref: '#/components/schemas/Round' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default deleteRound;
