import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';
import log from '../log/insertEventLog';

const postSchool = {
    POST: async (req, res) => {
        const name = req.body.displayName?.replaceAll(' ', '');

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
            SELECT * FROM caselists C WHERE C.name = ${req.params.caselist}
        `);
        if (!caselist || caselist.length < 1) {
            return res.status(400).json({ message: 'Invalid caselist' });
        }
        if (caselist[0].archived) {
            return res.status(401).json({ message: 'Caselist archived, no modifications allowed' });
        }

        const newSchool = await query(SQL`
            INSERT INTO schools (caselist_id, name, display_name, state, chapter_id, created_by_id, updated_by_id)
            VALUES (
                ${caselist[0].caselist_id},
                ${name},
                ${req.body.displayName?.trim()},
                ${req.body.state?.trim()},
                ${req.body.chapter_id || null},
                ${req.user_id},
                ${req.user_id}
            )
        `);

        await query(SQL`
                INSERT INTO schools_history (
                    school_id,
                    version,
                    caselist_id,
                    name,
                    display_name,
                    state,
                    chapter_id,
                    created_at,
                    created_by_id,
                    updated_at,
                    updated_by_id,
                    event
                )
                SELECT
                    S.school_id,
                    (SELECT COALESCE(MAX(version), 0) + 1 FROM schools_history SH WHERE SH.school_id = S.school_id) AS 'version',
                    S.caselist_id,
                    S.name,
                    S.display_name,
                    S.state,
                    S.chapter_id,
                    S.created_at,
                    S.created_by_id,
                    S.updated_at,
                    S.updated_by_id,
                    'insert'
                FROM schools S WHERE S.school_id = ${newSchool.insertId}
        `);

        await log({
            user_id: req.user_id,
            tag: 'school-add',
            description: `Added school #${newSchool.insertId} in ${req.params.caselist}`,
            school_id: parseInt(newSchool.insertId),
        });

        const [result] = await query(SQL`
            SELECT * FROM schools WHERE school_id = ${newSchool.insertId}
        `);

        return res.status(201).json(result);
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
