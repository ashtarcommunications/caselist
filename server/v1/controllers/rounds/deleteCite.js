import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const deleteCite = {
    DELETE: async (req, res) => {
        const [result] = await query(SQL`
            SELECT C.archived
            FROM cites CT
            INNER JOIN rounds R ON R.round_id = CT.cite_id
            INNER JOIN teams T on T.team_id = R.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            WHERE C.name = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            AND LOWER(T.name) = LOWER(${req.params.team})
            AND CT.cite_id = ${req.params.cite}
        `);

        if (!result) { return res.status(400).json({ message: 'Cite not found' }); }
        if (result.archived) { return res.status(401).json({ message: 'Caselist archived, no modifications allowed' }); }

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
