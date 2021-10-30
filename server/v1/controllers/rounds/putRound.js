import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const putRound = {
    PUT: async (req, res) => {
        await query(SQL`
            UPDATE cites CT 
            INNER JOIN rounds R ON R.round_id = C.round_id
            INNER JOIN teams T ON T.team_id = R.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            SET CT.deleted = 1
            WHERE C.slug = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            AND LOWER(T.code) = LOWER(${req.params.team})
            AND CT.round_id = ${req.params.round}
        `);

        await query(SQL`
            UPDATE rounds R
            INNER JOIN teams T ON T.team_id = R.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            SET R.updated_at = CURRENT_TIMESTAMP
            WHERE C.slug = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            AND LOWER(T.code) = LOWER(${req.params.team})
            AND CT.round_id = ${req.params.round}
        `);

        await query(SQL`
            INSERT INTO cites (round_id, cites)
            VALUES (${req.params.round}, ${JSON.stringify(req.body.cites)})
        `);

        return res.status(201).json({ message: 'Round successfully updated' });
    },
};

putRound.PUT.apiDoc = {
    summary: 'Updates a round',
    operationId: 'putRound',
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
    requestBody: {
        description: 'The round to update',
        required: true,
        content: { '*/*': { schema: { $ref: '#/components/schemas/Round' } } },
    },
    responses: {
        201: {
            description: 'Updated round',
            content: { '*/*': { schema: { $ref: '#/components/schemas/Round' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default putRound;
