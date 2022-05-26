import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';
import log from '../log/insertEventLog';

const putRound = {
    PUT: async (req, res) => {
        const [round] = await query(SQL`
            SELECT C.archived
            FROM rounds R
            INNER JOIN teams T ON T.team_id = R.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            WHERE C.name = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            AND LOWER(T.name) = LOWER(${req.params.team})
            AND R.round_id = ${parseInt(req.params.round)}
        `);

        if (!round) { return res.status(404).json({ message: 'Round not found' }); }
        if (round.archived) { return res.status(400).json({ message: 'Caselist archived, no modifications allowed' }); }

        await query(SQL`
            UPDATE rounds R
            SET
                R.side = ${req.body.side},
                R.tournament = ${req.body.tournament?.trim()},
                R.round = ${req.body.round?.trim()},
                R.opponent = ${req.body.opponent?.trim() || null},
                R.judge = ${req.body.judge?.trim() || null},
                R.report = ${req.body.report?.trim() || null},
                R.opensource = ${req.body.opensource?.trim() || null},
                R.video = ${req.body.video?.trim() || null},
                R.updated_at = CURRENT_TIMESTAMP,
                R.updated_by_id = ${req.user_id}
            WHERE R.round_id = ${parseInt(req.params.round)}
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
                    R.updated_at,
                    R.updated_by_id,
                    'update'
                FROM rounds R
                WHERE R.round_id = ${parseInt(req.params.round)}
        `);

        await log({
            user_id: req.user_id,
            tag: 'round-edit',
            description: `Edited round #${req.params.round} for ${req.params.school} ${req.params.team} in ${req.params.caselist}`,
            round_id: parseInt(req.params.round),
        });

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
