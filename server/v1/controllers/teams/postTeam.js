import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const postTeam = {
    POST: async (req, res) => {
        await query(SQL`
            INSERT INTO teams (school_id, name, code)
                SELECT S.school_id, ${req.body.name}, ${req.body.code}
                FROM schools S INNER JOIN caselists C
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
};

export default postTeam;
