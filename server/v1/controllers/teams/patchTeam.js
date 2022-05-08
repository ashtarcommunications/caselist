import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const patchTeam = {
    PATCH: async (req, res) => {
        const { body } = req;

        body.forEach((u) => {
            if (['notes'].indexOf(Object.keys(u)[0]) < 0) {
                return res.status(400).send({ message: 'Invalid update operation' });
            }
        });

        const sql = (SQL`
            SELECT C.archived, T.team_id
            FROM teams T
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON S.caselist_id = C.caselist_id
            LEFT JOIN users U ON U.user_id = T.updated_by_id
            wHERE C.name = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            AND LOWER(T.name) = LOWER(${req.params.team})
        `);
        const [team] = await query(sql);
        if (!team) { return res.status(400).json({ message: 'Team not found' }); }
        if (team.archived) { return res.status(401).json({ message: 'Caselist archived, no modifications allowed' }); }

        const promises = [];

        body.forEach((u) => {
            if (Object.keys(u)[0] === 'notes') {
                promises.push(
                    query(SQL`
                        UPDATE teams SET notes = ${u.notes.trim()}, updated_by_id = ${req.user_id}
                        WHERE T.team_id = ${team.team_id}
                    `)
                );
            }
        });

        await Promise.all(promises);

        const updatedTeam = await query(SQL`SELECT * FROM teams WHERE T.team_id = ${team.team_id}`);
        return res.status(200).json(updatedTeam);
    },
};

patchTeam.PATCH.apiDoc = {
    summary: 'Patches a team',
    operationId: 'patchTeam',
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
    requestBody: {
        description: 'The patch operation for the team',
        required: true,
        content: { '*/*': { schema: { $ref: '#/components/schemas/Updates' } } },
    },
    responses: {
        200: {
            description: 'Team updated',
            content: { '*/*': { schema: { $ref: '#/components/schemas/Team' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default patchTeam;
