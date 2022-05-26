import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';
import log from '../log/insertEventLog';

const deleteTeam = {
    DELETE: async (req, res) => {
        const [team] = await query(SQL`
            SELECT C.archived, T.team_id
            FROM teams T
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            WHERE C.name = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            AND LOWER(T.name) = LOWER(${req.params.team})
        `);

        if (!team) { return res.status(400).json({ message: 'Team not found' }); }
        if (team.archived) { return res.status(403).json({ message: 'Caselist archived, no modifications allowed' }); }

        await query(SQL`
            INSERT INTO cites_history (
                cite_id,
                version,
                round_id,
                title,
                cites,
                created_at,
                created_by_id,
                updated_at,
                updated_by_id,
                event
            )
            SELECT
                CT.cite_id,
                (SELECT COALESCE(MAX(version), 0) + 1 FROM cites_history CH WHERE CH.cite_id = CT.cite_id) AS 'version',
                CT.round_id,
                CT.title,
                CT.cites,
                CT.created_at,
                CT.created_by_id,
                CURRENT_TIMESTAMP,
                ${req.user_id},
                'delete'
            FROM cites CT
            INNER JOIN rounds R ON R.round_id = CT.round_id
            WHERE R.team_id = ${parseInt(team.team_id)}
        `);

        await query(SQL`
            DELETE CT.*
            FROM cites CT
            INNER JOIN rounds R ON R.round_id = CT.round_id
            WHERE R.team_id = ${parseInt(team.team_id)}
        `);

        await query(SQL`
            INSERT INTO rounds_history (
                round_id,
                version,
                team_id,
                side,
                tournament,
                round,
                opponent,
                judge,
                report,
                opensource,
                video,
                tourn_id,
                external_id,
                created_at,
                created_by_id,
                updated_at,
                updated_by_id,
                event
            )
            SELECT
                R.round_id,
                (SELECT COALESCE(MAX(version), 0) + 1 FROM rounds_history RH WHERE RH.round_id = R.round_id) AS 'version',
                R.team_id,
                R.side,
                R.tournament,
                R.round,
                R.opponent,
                R.judge,
                R.report,
                R.opensource,
                R.video,
                R.tourn_id,
                R.external_id,
                R.created_at,
                R.created_by_id,
                CURRENT_TIMESTAMP,
                ${req.user_id},
                'delete'
            FROM rounds R
            WHERE R.team_id = ${parseInt(team.team_id)}
        `);

        await query(SQL`
            DELETE FROM rounds WHERE team_id = ${parseInt(team.team_id)}
        `);

        await query(SQL`
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
                CURRENT_TIMESTAMP,
                ${req.user_id},
                'delete'
            FROM teams T
            WHERE T.team_id = ${parseInt(team.team_id)}
        `);

        await query(SQL`
            DELETE FROM teams WHERE team_id = ${parseInt(team.team_id)}
        `);

        await log({
            user_id: req.user_id,
            tag: 'team-delete',
            description: `Deleted team ${req.params.school} ${req.params.team} in ${req.params.caselist}`,
            team_id: team.team_id,
        });

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
