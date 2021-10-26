import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const postTeam = {
    POST: async (req, res) => {
        const name = `${req.params.school} ${req.body.debater1_last.slice(0, 2)}${req.body.debater2_last.slice(0, 2)}`;
        const code = `${req.body.debater1_last.slice(0, 2)}${req.body.debater2_last.slice(0, 2)}`;

        const team = await (query(SQL`
                SELECT *
                FROM teams T
                INNER JOIN schools S ON S.school_id = T.school_id
                INNER JOIN caselists C ON S.caselist_id = C.caselist_id
                WHERE C.slug = ${req.params.caselist}
                AND S.name = ${req.params.school}
                AND T.code = ${code}
        `));
        if (team && team.length > 0) {
            return res.status(400).json({ message: 'Team already exists' });
        }

        await query(SQL`
            INSERT INTO teams
                (school_id, name, code, debater1_first, debater1_last, debater2_first, debater2_last)
                SELECT
                    S.school_id,
                    ${name},
                    ${code},
                    ${req.body.debater1_first},
                    ${req.body.debater1_last},
                    ${req.body.debater2_first},
                    ${req.body.debater2_last}
                FROM schools S
                INNER JOIN caselists C ON S.caselist_id = C.caselist_id
                WHERE C.slug = ${req.params.caselist}
                AND S.name = ${req.params.school}
        `);

        return res.status(201).json({ message: 'Team successfully created' });
    },
};

postTeam.POST.apiDoc = {
    summary: 'Creates a team',
    operationId: 'postTeam',
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
    ],
    requestBody: {
        description: 'The team to create',
        required: true,
        content: { '*/*': { schema: { $ref: '#/components/schemas/Team' } } },
    },
    responses: {
        201: {
            description: 'Created team',
            content: { '*/*': { schema: { $ref: '#/components/schemas/Team' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default postTeam;
