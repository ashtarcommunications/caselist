import SQL from 'sql-template-strings';
import fs from 'fs';
import { cwd } from 'process';
import { query } from '../../helpers/mysql';
import log from '../log/insertEventLog';

const postFile = {
    POST: async (req, res) => {
        let filename;
        let path;

        if (req.body.file && req.body.filename) {
            // Convert base64 encoded file back into a buffer for saving
            let arrayBuffer;
            try {
                arrayBuffer = Buffer.from(req.body.file, 'base64');
            } catch (err) {
                return res.status(400).json({ message: 'Invalid file' });
            }

            // Use the extension from the provided file, but disallow anything weird
            let extension = path.extname(req.body.filename);
            if (['.docx', '.doc', '.pdf', '.rtf', '.txt'].indexOf(extension) === -1) {
                extension = '';
            }
            filename = `${req.body.filename} ${req.body.year} `;
            filename += `${req.body.camp.trim()} `;
            filename += `${req.body.lab.trim()}`;
            filename += `${extension}`;

            path = `${cwd()}/uploads/openev/${req.body.year}/`;

            try {
                await fs.promises.mkdir(`${cwd()}/uploads/openev/${req.body.year}`, { recursive: true });
                await fs.promises.writeFile(`${path}${filename}`, arrayBuffer);
            } catch (err) {
                return res.status(500).json({ message: 'Failed to upload file' });
            }
        }

        try {
            await query(SQL`
                INSERT INTO openev (path, year, camp, lab, tags, created_by_id)
                VALUES (
                    ${path}${filename},
                    ${req.body.year},
                    ${req.body.camp?.trim()},
                    ${req.body.lab?.trim()},
                    ${JSON.stringify(req.body.tags)},
                    ${req.user_id}
                )
            `);
        } catch (err) {
            return res.status(500).json({ message: 'Failed to upload OpenEv file' });
        }

        await log({
            user_id: req.user_id,
            tag: 'openev-add',
            description: `Added file ${path}${filename} to OpenEv ${req.body.year}`,
        });

        return res.status(201).json({ message: 'File successfully uploaded' });
    },
};

postFile.POST.apiDoc = {
    summary: 'Creates an OpenEv file',
    operationId: 'postFile',
    requestBody: {
        description: 'The file to upload',
        required: true,
        content: { '*/*': { schema: { $ref: '#/components/schemas/File' } } },
    },
    responses: {
        201: {
            description: 'Created file',
            content: { '*/*': { schema: { $ref: '#/components/schemas/File' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default postFile;
