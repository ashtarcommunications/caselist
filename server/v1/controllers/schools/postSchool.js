import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';

const postSchool = {
    POST: async (req, res) => {
        const name = req.body.display_name.replaceAll(' ', '');

        const school = await query(SQL`
            SELECT * FROM schools S
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            WHERE C.name = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${name})
        `);
        if (school && school.length > 0) {
            return res.status(400).json({ message: 'School with the same name already exists' });
        }

        const caselist = await query(SQL`
            SELECT * FROM caselists C WHERE C.slug = ${req.params.caselist}
        `);
        if (!caselist || caselist.length < 1) {
            return res.status(400).json({ message: 'Invalid caselist' });
        }
        if (caselist[0].archived) {
            return res.status(401).json({ message: 'Caselist archived, no modifications allowed' });
        }

        await query(SQL`
            INSERT INTO schools (caselist_id, name, display_name, state)
                SELECT caselist_id, ${name}, ${req.body.display_name.trim()}, ${req.body.state.trim() || null}
                FROM caselists WHERE name = ${req.params.caselist}
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
