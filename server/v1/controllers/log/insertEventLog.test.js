import { assert } from 'vitest';
import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql.js';
import insertEventLog from './insertEventLog.js';

describe('Insert Event Log', () => {
	it('Should insert an event into the log', async () => {
		const event = {
			user_id: 1,
			tag: 'test',
			description: 'test',
			school_id: 1,
			team_id: 1,
			round_id: 1,
			cite_id: 1,
		};

		// Second parameter overrides not logging during testing
		await insertEventLog(event, true);
		const result = await query(SQL`
            SELECT * FROM event_log WHERE tag = 'test'
        `);
		assert.strictEqual(result[0].user_id, 1, 'User matches');
		assert.strictEqual(result[0].tag, 'test', 'Tag matches');
		assert.strictEqual(result[0].description, 'test', 'Description matches');
		assert.strictEqual(result[0].school_id, 1, 'School matches');
		assert.strictEqual(result[0].team_id, 1, 'Team matches');
		assert.strictEqual(result[0].round_id, 1, 'Round matches');
		assert.strictEqual(result[0].cite_id, 1, 'Cite matches');
	});

	it('should error on invalid event parameter', async () => {
		try {
			const result = await insertEventLog('invalid');
			assert.isUndefined(result, 'Throws an error');
		} catch (err) {
			assert.isTrue(err instanceof Error, 'Throws an error');
			assert.strictEqual(err.message, 'Invalid event', 'Correct message');
		}
	});

	afterEach(async () => {
		await query(SQL`DELETE FROM event_log WHERE tag = 'test'`);
	});
});
