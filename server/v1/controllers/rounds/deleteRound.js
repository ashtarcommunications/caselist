import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const deleteRound = {
    DELETE: async (req, res) => {
        const [result] = await query(SQL`
            SELECT C.archived
            FROM rounds R
            INNER JOIN teams T on T.team_id = T.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            WHERE C.name = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            AND LOWER(T.name) = LOWER(${req.params.team})
            AND R.round_id = ${req.params.round}
        `);

        if (!result) { return res.status(400).json({ message: 'Round not found' }); }
        if (result.archived) { return res.status(401).json({ message: 'Caselist archived, no modifications allowed' }); }

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
