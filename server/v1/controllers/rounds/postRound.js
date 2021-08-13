import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const postRound = {
    POST: async (req, res) => {
        await query(SQL`
            INSERT INTO rounds (team_id, side, tournament, round, opponent, judge, report, tourn_id, external_id)
                SELECT
                    T.team_id,
                    ${req.body.side},
                    ${req.body.tournament},
                    ${req.body.round},
                    ${req.body.opponent},
                    ${req.body.judge},
                    ${req.body.report},
                    ${req.body.tourn_id},
                    ${req.body.external_id}
                FROM teams T
                INNER JOIN schools S ON S.team_id = T.team_id
                INNER JOIN caselists C ON S.caselist_id = C.caselist_id
                WHERE C.slug = ${req.params.caselist}
                AND S.name = ${req.params.school}
                AND T.code = ${req.params.team}
        `);

        return res.status(201).json({ message: 'Team successfully created' });
    },
};

postRound.POST.apiDoc = {
    summary: 'Creates a round',
    operationId: 'postRound',
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
        description: 'The round to create',
        required: true,
        content: { '*/*': { schema: { $ref: '#/components/schemas/Round' } } },
    },
    responses: {
        201: {
            description: 'Created round',
            content: { '*/*': { schema: { $ref: '#/components/schemas/Round' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default postRound;
