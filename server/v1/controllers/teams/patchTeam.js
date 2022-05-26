import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';
import log from '../log/insertEventLog';

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
        if (team.archived) { return res.status(400).json({ message: 'Caselist archived, no modifications allowed' }); }

        const promises = [];

        body.forEach((u) => {
            if (Object.keys(u)[0] === 'notes') {
                promises.push(
                    query(SQL`
                        UPDATE teams
                        SET
                            notes = ${u.notes?.trim()},
                            updated_by_id = ${req.user_id}
                        WHERE team_id = ${parseInt(team.team_id)}
                    `).then(() => {
                        return query(SQL`
                            INSERT INTO teams_history (
                                team_id,
                                version,
                                school_id,
                                name,
                                display_name,
                                notes,
                                debater1_first,
                                debater1_last,
                                debater1_student_id,
                                debater2_first,
                                debater2_last,
                                debater2_student_id,
                                debater3_first,
                                debater3_last,
                                debater3_student_id,
                                debater4_first,
                                debater4_last,
                                debater4_student_id,
                                created_at,
                                created_by_id,
                                updated_at,
                                updated_by_id,
                                event
                            )
                            SELECT
                                T.team_id,
                                (SELECT COALESCE(MAX(version), 0) + 1 FROM teams_history TH WHERE TH.team_id = T.team_id) AS 'version',
                                T.school_id,
                                T.name,
                                T.display_name,
                                T.notes,
                                T.debater1_first,
                                T.debater1_last,
                                T.debater1_student_id,
                                T.debater2_first,
                                T.debater2_last,
                                T.debater2_student_id,
                                T.debater3_first,
                                T.debater3_last,
                                T.debater3_student_id,
                                T.debater4_first,
                                T.debater4_last,
                                T.debater4_student_id,
                                T.created_at,
                                T.created_by_id,
                                T.updated_at,
                                T.updated_by_id,
                                'update'
                            FROM teams T
                            WHERE T.team_id = ${parseInt(team.team_id)}
                        `);
                    })
                );
            }
        });

        await Promise.all(promises);

        await log({
            user_id: req.user_id,
            tag: 'team-edit',
            description: `Edited team ${req.params.school} ${req.params.team} in ${req.params.caselist}`,
            team_id: team.team_id,
        });

        return res.status(200).json({ message: 'Team successfully updated' });
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
