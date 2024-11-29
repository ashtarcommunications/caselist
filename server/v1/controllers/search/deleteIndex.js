/* istanbul ignore file */
// Run from CLI like:
// node --experimental-specifier-resolution=node -e 'import("./v1/controllers/search/deleteIndex").then(m => m.deleteIndex());'
import { fetch } from '@speechanddebate/nsda-js-utils';

import config from '../../../config.js';
import { solrLogger } from '../../helpers/logger.js';

export const deleteIndex = async () => {
	solrLogger.info('Deleting current Solr index...');
	try {
		await fetch(config.SOLR_UPDATE_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ delete: { query: '*:*' } }),
		});
	} catch (err) {
		solrLogger.error(
			`Failed to delete current index, aborting: ${err.message}`,
		);
		return false;
	}

	solrLogger.info('Finished deleting Solr index.');
	return true;
};

export default deleteIndex;
