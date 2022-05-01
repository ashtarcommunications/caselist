import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const getTeam = {
    GET: async (req, res) => {
        const sql = (SQL`
            SELECT
                C.archived,
                T.*,
                U.display_name AS 'updated_by'
            FROM teams T
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON S.caselist_id = C.caselist_id
            LEFT JOIN users U ON U.user_id = T.updated_by_id
            wHERE C.slug = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            AND LOWER(T.code) = LOWER(${req.params.team})
        `);
        const [team] = await query(sql);
        if (!team) { return res.status(404).json({ message: 'Team not found' }); }

        if (team.archived) {
            team.debater1_first = team.debater1_first ? `${team.debater1_first.substr(0, 2)}.....` : null;
            team.debater1_last = team.debater1_last ? `${team.debater1_last.substr(0, 2)}.....` : null;
            team.debater2_first = team.debater2_first ? `${team.debater2_first.substr(0, 2)}.....` : null;
            team.debater2_last = team.debater2_last ? `${team.debater2_last.substr(0, 2)}.....` : null;
            team.debater3_first = team.debater3_first ? `${team.debater3_first.substr(0, 2)}.....` : null;
            team.debater3_last = team.debater3_last ? `${team.debater3_last.substr(0, 2)}.....` : null;
            team.debater4_first = team.debater4_first ? `${team.debater4_first.substr(0, 2)}.....` : null;
            team.debater4_last = team.debater4_last ? `${team.debater4_last.substr(0, 2)}.....` : null;
            delete team.updated_by;
        }

        return res.status(200).json(team);
    },
};

getTeam.GET.apiDoc = {
    summary: 'Returns a single team',
    operationId: 'getTeam',
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
            description: 'Which school team belongs to',
            required: true,
            schema: { type: 'string' },
        },
        {
            in: 'path',
            name: 'team',
            description: 'Which team to return',
            required: true,
            schema: { type: 'string' },
        },
    ],
    responses: {
        200: {
            description: 'Team',
            content: { '*/*': { schema: { $ref: '#/components/schemas/Team' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
};

export default getTeam;
