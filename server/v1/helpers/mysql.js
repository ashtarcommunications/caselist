/* istanbul ignore file */
import mysql from 'mysql2';
import config from '../../config.js';
import { debugLogger, queryLogger } from './logger.js';

export const pool = mysql
	.createPool({
		host: config.DB_HOST,
		user: config.DB_USER,
		port: config.DB_PORT || 3306,
		password: config.DB_PASS,
		database: config.DB_DATABASE,
		connectionLimit: config.DB_CONNECTION_LIMIT || 50,
		connectTimeout: config.DB_CONNECTION_TIMEOUT || 60000,
		timezone: 'Z',
		dateStrings: true,
		decimalNumbers: true,
	})
	.promise();

export const query = async (sql) => {
	const maxRetries =
		typeof config.DB_RETRIES === 'number' && config.DB_RETRIES > -1
			? config.DB_RETRIES
			: 5;
	const retryDelay =
		typeof config.DB_RETRY_DELAY === 'number' && config.DB_RETRY_DELAY > -1
			? config.DB_RETRY_DELAY
			: 100;

	// Retry connection issues or deadlocks, but not query errors
	for (let i = 0; i < maxRetries; i++) {
		try {
			// For subsequent retries, wait the delay
			// eslint-disable-next-line no-await-in-loop, no-promise-executor-return
			if (i > 0) {
				// eslint-disable-next-line no-await-in-loop
				await new Promise((resolve) => {
					setTimeout(resolve, retryDelay);
				});
			}

			// eslint-disable-next-line no-await-in-loop
			const [result] = await pool.query(sql);
			return result;
		} catch (err) {
			if (err.code === 'ECONNREFUSED') {
				debugLogger.error(
					`Database connection error ${err.code}, retry #${i}`,
					{ err, stack: err.stack },
				);
			} else if (err.errno === 1213 || err.errno === 1205) {
				debugLogger.error(`Deadlock error ${err.errno}, retry #${i}`, {
					err,
					stack: err.stack,
				});
			} else {
				debugLogger.error(`Query error ${err.errno}`, {
					err,
					stack: err.stack,
				});
				queryLogger.error(`Query error ${err.errno}`, {
					err,
					stack: err.stack,
				});
				// Exit retries early
				throw new Error('Internal server error');
			}
			// If out of retries, throw generic error to hide details from user, real one is logged
			if (i === maxRetries - 1) {
				throw new Error('Internal server error');
			}
		}
	}

	return null;
};
