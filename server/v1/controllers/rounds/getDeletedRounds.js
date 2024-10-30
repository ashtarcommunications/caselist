import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const getDeletedRounds = {
    GET: async (req, res) => {
        const sql = (SQL`
            SELECT R.*
            FROM rounds_history R 
            INNER JOIN teams T ON T.team_id = R.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON S.caselist_id = C.caselist_id
            WHERE C.name = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            AND LOWER(T.name = ${req.params.team})
            AND LOWER(R.event = 'delete')
        `);
        if (req.query.side) {
            sql.append(SQL`AND LOWER(R.side) = LOWER(${req.query.side})`);
        }
        sql.append(`ORDER BY R.tournament, R.round`);

        const rounds = await query(sql);

        return res.status(200).json(rounds.filter(round => {
            return !round.tournament.includes("All Tournaments") // Don't show updates to general disclosures
        }
        ).map(round => { // only return some fields 
                return {
                    round_id: round.round_id,
                    version: round.version,
                    team_id: round.version,
                    side: round.side,
                    tournament: round.tournament,
                    round: round.round,
                    opponent: round.opponent,
                    judge: round.judge,
                    updated_at: round.updated_at,
                    updated_by_id: round.updated_by_id
                }
            }
        ));
    },
};

getDeletedRounds.GET.apiDoc = {
    summary: 'Returns list of deleted rounds for a team. Some fields are intentionally blanked to allow deletion of sensitive information.',
    operationId: 'getRounds',
    parameters: [
        {
            in: 'path',
            name: 'caselist',
            description: 'Which caselist to return schools in',
            required: true,
            schema: { type: 'string' },
        },
        {
            in: 'path',
            name: 'school',
            description: 'Which school to return teams in',
            required: true,
            schema: { type: 'string' },
        },
        {
            in: 'path',
            name: 'team',
            description: 'Which team to return rounds in',
            required: true,
            schema: { type: 'string' },
        },
        {
            in: 'query',
            name: 'side',
            description: 'Which side to return rounds for',
            required: false,
            schema: { type: 'string' },
        },
    ],
    responses: {
        200: {
            description: 'Rounds',
            content: {
                '*/*': {
                    schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Round' },
                    },
                },
            },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default getDeletedRounds;
