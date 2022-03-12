import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const deleteTeam = {
    DELETE: async (req, res) => {
        const [result] = await query(SQL`
            SELECT C.archived
            FROM teams T
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            WHERE C.slug = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            AND LOWER(T.code) = LOWER(${req.params.team})
        `);

        if (!result) { return res.status(400).json({ message: 'Team not found' }); }
        if (result.archived) { return res.status(401).json({ message: 'Caselist archived, no modifications allowed' }); }

        const teamId = await query(SQL`
            SELECT team_id FROM teams T
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            WHERE LOWER(S.name) = LOWER(${req.params.school})
            AND C.slug = ${req.params.caselist}
            AND LOWER(T.code) = LOWER(${req.params.team})
        `);
        await query(SQL`
            UPDATE teams SET deleted = 1 WHERE team_id = ${teamId}
        `);
        await query(SQL`
            UPDATE cites CT
            INNER JOIN rounds R ON R.round_id = CT.round_id
            INNER JOIN teams T ON T.team_id = R.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            SET CT.deleted = 1
            WHERE C.slug = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            AND LOWER(T.code) = LOWER(${req.params.team})
        `);
        await query(SQL`
            UPDATE rounds R
            INNER JOIN teams T ON T.team_id = R.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            SET R.deleted = 1
            WHERE C.slug = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            AND LOWER(T.code) = LOWER(${req.params.team})
        `);

        return res.status(201).json({ message: 'Team successfully deleted' });
    },
};

deleteTeam.DELETE.apiDoc = {
    summary: 'Deletes a team',
    operationId: 'deleteTeam',
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
    ],
    responses: {
        201: {
            description: 'Deleted team',
            content: { '*/*': { schema: { $ref: '#/components/schemas/Team' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default deleteTeam;
