import SQL from 'sql-template-strings';
import fs from 'fs';
import { fetch, startOfYear } from '@speechanddebate/nsda-js-utils';

import config from '../../../config';
import { query } from '../../helpers/mysql';
import log from '../log/insertEventLog';
import { debugLogger } from '../../helpers/logger';

const deleteFile = {
    DELETE: async (req, res) => {
        if (!config.ADMINS?.includes(req.user_id)) {
            return res.status(401).json({ message: 'Only admins can delete OpenEv files' });
        }

        const [file] = await query(SQL`
            SELECT O.year, O.path
            FROM openev O
            WHERE O.openev_id = ${req.params.id}
        `);

        if (!file) { return res.status(400).json({ message: 'File not found' }); }
        if (file.year !== startOfYear) { return res.status(403).json({ message: 'This year of OpenEv is archived, no modifications allowed' }); }

        try {
            await fs.promises.rm(`${config.UPLOAD_DIR}/${file.path}`);
        } catch (err) {
            debugLogger.info(`Failed to delete ${file.path}`);
            return res.status(500).json({ message: 'Failed to delete file' });
        }

        const body = JSON.stringify({ delete: { id: file.path } });
        try {
            await fetch(
                'http://localhost:8983/solr/caselist/update?commit=true',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body,
                }
            );
        } catch (err) {
            debugLogger.info(`Failed to remove ${file.path} from Solr`);
        }

        await query(SQL`
            DELETE FROM openev WHERE openev_id = ${parseInt(req.params.id)}
        `);

        await log({
            user_id: req.user_id,
            tag: 'openev-delete',
            description: `Deleted openev #${req.params.id} at ${file.path}`,
        });

        return res.status(200).json({ message: 'File successfully deleted' });
    },
};

deleteFile.DELETE.apiDoc = {
    summary: 'Deletes a file',
    operationId: 'deleteFile',
    parameters: [
        {
            in: 'path',
            name: 'id',
            description: 'File ID to delete',
            required: true,
            schema: { type: 'integer' },
        },
    ],
    responses: {
        200: {
            description: 'Deleted file',
            content: { '*/*': { schema: { $ref: '#/components/schemas/File' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default deleteFile;
