import SQL from 'sql-template-strings';
import fs from 'fs';
import path from 'path';
import { cwd } from 'process';
import { query } from '../../helpers/mysql';

const postRound = {
    POST: async (req, res) => {
        console.log(req.body);
        const buff = Buffer.from(req.body.opensource, 'base64');

        let extension = path.extname(req.body.filename);
        // Disallow other extensions in case of shenanigans
        if (['.docx', '.doc', '.pdf', '.rtf', '.txt'].indexOf(extension) === -1) {
            extension = '';
        }
        // TODO - helper function for side name, maybe send event from client side
        const filename = `${req.params.school} ${req.params.team} ${req.body.side} ${req.body.tourn} Round ${req.body.round}${extension}`;

        fs.writeFileSync(`${cwd()}/uploads/${filename}`, buff);

        const [result] = await query(SQL`
            SELECT C.archived
            FROM teams T
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            WHERE C.slug = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            AND LOWER(T.code) = LOWER(${req.params.team})
        `);

        if (!result) { return res.status(400).json({ message: 'Team not found' }); }
        if (result.archived) { return res.status(401).json({ message: 'Caselist archived, no modifications allowed' }); }

        await query(SQL`
            INSERT INTO rounds (team_id, side, tournament, round, opponent, judge, report, tourn_id, external_id)
                SELECT
                    T.team_id,
                    ${req.body.side},
                    ${req.body.tourn},
                    ${req.body.round},
                    ${req.body.opponent},
                    ${req.body.judge},
                    ${req.body.report},
                    ${req.body.tourn_id || null},
                    ${req.body.external_id || null}
                FROM teams T
                INNER JOIN schools S ON S.school_id = T.school_id
                INNER JOIN caselists C ON C.caselist_id = S.caselist_id
                WHERE C.slug = ${req.params.caselist}
                AND LOWER(S.name) = LOWER(${req.params.school})
                AND LOWER(T.code) = LOWER(${req.params.team})
        `);
        return res.status(201).json({ message: 'Round successfully created' });
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
