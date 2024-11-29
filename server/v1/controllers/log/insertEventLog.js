import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql.js';
import { debugLogger } from '../../helpers/logger.js';

const insertEventLog = async (event, test) => {
	if (
		!event ||
		typeof event !== 'object' ||
		(event.user_id && typeof event.user_id !== 'number') ||
		!event.tag ||
		typeof event.tag !== 'string' ||
		(event.description && typeof event.description !== 'string') ||
		(event.school_id && typeof event.school_id !== 'number') ||
		(event.team_id && typeof event.team_id !== 'number') ||
		(event.round_id && typeof event.round_id !== 'number') ||
		(event.cite_id && typeof event.cite_id !== 'number')
	) {
		debugLogger.error('Invalid log event', { event });
		throw new Error('Invalid event');
	}

	// Don't log if testing, unless explicitly testing the module
	if (process.env.NODE_ENV === 'test' && !test) {
		return false;
	}

	try {
		await query(SQL`
            INSERT INTO event_log (user_id, tag, description, school_id, team_id, round_id, cite_id)
            VALUES (${event.user_id}, ${event.tag}, ${event.description}, ${event.school_id}, ${event.team_id}, ${event.round_id}, ${event.cite_id})
        `);
	} catch (err) {
		debugLogger.error('Failed to log event', { err, stack: err.stack });
		throw err;
	}

	return true;
};

export default insertEventLog;
