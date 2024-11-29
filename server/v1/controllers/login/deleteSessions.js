/* istanbul ignore file */
import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql.js';
import { debugLogger } from '../../helpers/logger.js';

export const deleteSessions = async () => {
	debugLogger.info('Deleting expired sessions...');
	const sql = SQL`
		DELETE FROM sessions
		WHERE expires_at < CURRENT_TIMESTAMP
    `;

	try {
		await query(sql);
		debugLogger.info('Expired sessions deleted.');
	} catch (error) {
		debugLogger.error(`Error deleting expired sessions: ${error}`);
	}
	return null;
};

export default deleteSessions;
