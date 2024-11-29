/* istanbul ignore file */
import crypto from 'crypto';
import SQL from 'sql-template-strings';
import { query } from './mysql.js';
import { debugLogger } from './logger.js';

const auth = async (req) => {
	if (!req.cookies.caselist_token) {
		const err = new Error('Not Authorized');
		err.status = 401;
		throw err;
	}

	const hash = crypto
		.createHash('sha256')
		.update(req.cookies.caselist_token)
		.digest('hex');
	let sql = SQL`
        SELECT * FROM sessions WHERE token = ${hash} AND expires_at > NOW()
    `;
	const session = await query(sql);
	if (session && session.length > 0) {
		req.user_id = session[0].user_id;

		// Check account reputation for non-GET requests, block un-trusted users from modifications
		if (
			req.method !== 'OPTIONS' &&
			req.method !== 'GET' &&
			!req.url.includes('login')
		) {
			sql = SQL`SELECT trusted FROM users WHERE user_id = ${req.user_id}`;
			const user = await query(sql);
			if (!user || user.length < 1 || !user[0].trusted) {
				let message = 'Not Authorized. ';
				message +=
					'You must be a real student, judge, or coach on Tabroom to make modifications. ';
				message += 'Try waiting a few days and then log in again.';

				const err = new Error(message);
				err.status = 401;
				throw err;
			}
		}

		return true;
	}

	// Default to unauthorized
	const err = new Error('Not Authorized');
	err.status = 401;
	debugLogger.error(`Authorization failed: ${err.message}`);
	throw err;
};

export default auth;
