import SQL from 'sql-template-strings';
import fs from 'fs';
import path from 'path';
import { cwd } from 'process';
import { query } from '../../helpers/mysql';

const postRound = {
    POST: async (req, res) => {
        console.log(req.body);

        const [result] = await query(SQL`
            SELECT C.archived
            FROM teams T
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            WHERE C.name = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            AND LOWER(T.name) = LOWER(${req.params.team})
        `);

        if (!result) { return res.status(400).json({ message: 'Team not found' }); }
        if (result.archived) { return res.status(401).json({ message: 'Caselist archived, no modifications allowed' }); }

        let filename;

        if (req.body.opensource && req.body.filename) {
            // Convert base64 encoded file back into a buffer for saving
            let arrayBuffer;
            try {
                arrayBuffer = Buffer.from(req.body.opensource, 'base64');
            } catch (err) {
                return res.status(400).json({ message: 'Invalid open source file' });
            }

            // Use the extensinon from the provided file, but disallow anything weird
            let extension = path.extname(req.body.filename);
            if (['.docx', '.doc', '.pdf', '.rtf', '.txt'].indexOf(extension) === -1) {
                extension = '';
            }
            // TODO - helper function for side name, maybe send event from client side
            filename = `${req.params.school} ${req.params.team} ${req.body.side} ${req.body.tourn} Round ${req.body.round}${extension}`;

            // TODO - decide on a file structure and whether to add a hash or something
            await fs.promises.mkdir(`${cwd()}/uploads/${req.params.caselist}/${req.params.school}/${req.params.team}`, { recursive: true });
            await fs.promises.writeFile(`${cwd()}/uploads/${req.params.caselist}/${req.params.school}/${req.params.team}/${filename}`, arrayBuffer);
        }

        await query(SQL`
            INSERT INTO rounds (team_id, side, tournament, round, opponent, judge, report, opensource, tourn_id, external_id)
                SELECT
                    T.team_id,
                    ${req.body.side},
                    ${req.body.tourn},
                    ${req.body.round},
                    ${req.body.opponent},
                    ${req.body.judge},
                    ${req.body.report},
                    ${filename},
                    ${req.body.tourn_id || null},
                    ${req.body.external_id || null}
                FROM teams T
                INNER JOIN schools S ON S.school_id = T.school_id
                INNER JOIN caselists C ON C.caselist_id = S.caselist_id
                WHERE C.name = ${req.params.caselist}
                AND LOWER(S.name) = LOWER(${req.params.school})
                AND LOWER(T.name) = LOWER(${req.params.team})
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
