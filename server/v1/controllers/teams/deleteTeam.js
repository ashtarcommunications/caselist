import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const deleteTeam = {
    DELETE: async (req, res) => {
        const teamId = await query(SQL`
            SELECT team_id FROM teams T
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            WHERE S.name = ${req.params.school}
            AND C.slug = ${req.params.caselist}
            AND T.code = ${req.params.team}
        `);
        await query(SQL`
            UPDATE teams SET deleted = 1 WHERE team_id = ${teamId}
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
};

export default deleteTeam;
