import { assert } from 'vitest';
import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql.js';
import { deleteSessions } from './deleteSessions.js';

describe('deleteSessions', () => {
	beforeEach(async () => {
		await query(SQL`
			INSERT INTO sessions (token, user_id, ip, created_at, expires_at) VALUES
				('test', 1, '', CURRENT_TIMESTAMP - INTERVAL 2 DAY, CURRENT_TIMESTAMP - INTERVAL 1 DAY);
        `);
	});

	it('should delete expired sessions', async () => {
		await deleteSessions();
		const sessions = await query(SQL`
            SELECT COUNT(*) AS 'count' FROM sessions WHERE expires_at < CURRENT_TIMESTAMP
        `);
		assert.strictEqual(sessions[0].count, 0, 'Sessions deleted');
	});

	afterEach(async () => {
		await query(SQL`
            DELETE FROM sessions WHERE token = 'test'
        `);
	});
});
