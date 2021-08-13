import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const postSchool = {
    POST: async (req, res) => {
        await query(SQL`
            INSERT INTO schools (caselist_id, name, display_name, state)
                SELECT caselist_id, ${req.body.name}, ${req.body.display_name}, ${req.body.state}
                FROM caselists WHERE slug = ${req.params.caselist}
        `);

        return res.status(201).json({ message: 'School successfully created' });
    },
};

postSchool.POST.apiDoc = {
    summary: 'Creates a school',
    operationId: 'postSchool',
    parameters: [
        {
            in: 'path',
            name: 'caselist',
            description: 'Caselist',
            required: true,
            schema: { type: 'string' },
        },
    ],
    requestBody: {
        description: 'The school to create',
        required: true,
        content: { '*/*': { schema: { $ref: '#/components/schemas/School' } } },
    },
    responses: {
        201: {
            description: 'Created school',
            content: { '*/*': { schema: { $ref: '#/components/schemas/School' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default postSchool;
