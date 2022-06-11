import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';
import log from '../log/insertEventLog';

const postCite = {
    POST: async (req, res) => {
        const [round] = await query(SQL`
            SELECT C.archived
            FROM rounds R
            INNER JOIN teams T ON T.team_id = R.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            WHERE C.name = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            AND LOWER(T.name) = LOWER(${req.params.team})
            AND R.round_id = ${req.body.round_id}
        `);

        if (!round) { return res.status(400).json({ message: 'Round not found' }); }
        if (round.archived) { return res.status(403).json({ message: 'Caselist archived, no modifications allowed' }); }

        const cite = await query(SQL`
            INSERT INTO cites (round_id, title, cites, created_by_id, updated_by_id)
            VALUES (
                    ${req.body.round_id},
                    ${req.body.title.trim()},
                    ${req.body.cites.trim()},
                    ${req.user_id},
                    ${req.user_id}
            )
        `);

        await query(SQL`
            INSERT INTO cites_history (cite_id, version, round_id, title, cites, created_at, created_by_id, updated_at, updated_by_id, event)
            SELECT
                CT.cite_id,
                (SELECT COALESCE(MAX(version), 0) + 1 FROM cites_history CH WHERE CH.cite_id = CT.cite_id) AS 'version',
                CT.round_id,
                CT.title,
                CT.cites,
                CT.created_at,
                CT.created_by_id,
                CT.updated_at,
                CT.updated_by_id,
                'insert'
            FROM cites CT
            WHERE CT.cite_id = ${cite.insertId}
        `);

        await log({
            user_id: req.user_id,
            tag: 'cite-add',
            description: `Created cite #${cite.insertId} for ${req.params.school} ${req.params.team} in ${req.params.caselist}`,
            cite_id: parseInt(cite.insertId),
        });

        return res.status(201).json({ message: 'Cite successfully created' });
    },
};

postCite.POST.apiDoc = {
    summary: 'Creates a cite',
    operationId: 'postCite',
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
        description: 'The cite to create',
        required: true,
        content: { '*/*': { schema: { $ref: '#/components/schemas/Cite' } } },
    },
    responses: {
        201: {
            description: 'Created cite',
            content: { '*/*': { schema: { $ref: '#/components/schemas/Cite' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default postCite;
