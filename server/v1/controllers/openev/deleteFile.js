import SQL from 'sql-template-strings';
import fs from 'fs';
import { fetch, startOfYear } from '@speechanddebate/nsda-js-utils';

import config from '../../../config.js';
import { query } from '../../helpers/mysql.js';
import log from '../log/insertEventLog.js';
import { solrLogger, debugLogger } from '../../helpers/logger.js';

const deleteFile = {
	DELETE: async (req, res) => {
		if (!req.admin) {
			return res
				.status(401)
				.json({ message: 'Only admins can delete OpenEv files' });
		}

		const [file] = await query(SQL`
            SELECT O.year, O.path
            FROM openev O
            WHERE O.openev_id = ${req.params.id}
        `);

		if (!file) {
			return res.status(400).json({ message: 'File not found' });
		}
		if (file.year !== startOfYear()) {
			return res.status(403).json({
				message: 'This year of OpenEv is archived, no modifications allowed',
			});
		}

		try {
			await fs.promises.rm(`${config.UPLOAD_DIR}/${file.path}`);
		} catch (err) {
			debugLogger.info(`Failed to delete ${file.path}`);
			return res.status(500).json({ message: 'Failed to delete file' });
		}

		await query(SQL`
            DELETE FROM openev WHERE openev_id = ${parseInt(req.params.id)}
        `);

		await log({
			user_id: req.user_id,
			tag: 'openev-delete',
			description: `Deleted openev #${req.params.id} at ${file.path}`,
		});

		res.status(200).json({ message: 'File successfully deleted' });

		// Delete open ev document from Solr - wait till afer response to not slow down UI
		try {
			await fetch(config.SOLR_UPDATE_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ delete: { id: file.path } }),
			});
			solrLogger.info(`Removed ${file.path} from Solr`);
		} catch (err) {
			solrLogger.info(
				`Failed to remove ${file.path} from Solr: ${err.message}`,
			);
		}

		return true;
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
