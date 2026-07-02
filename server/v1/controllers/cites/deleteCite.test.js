import { assert } from 'vitest';
import SQL from 'sql-template-strings';
import request from 'supertest';
import { query } from '../../helpers/mysql.js';
import server from '../../../index.js';

describe('DELETE /v1/caselists/{caselist}/schools/{school}/teams/{team}/cites/{cite}', () => {
	it('should delete a cite', async () => {
		const newCite = await query(SQL`
            INSERT INTO cites (round_id, title, cites, created_by_id) VALUES
                (1, 'Delete Test Cite', 'Delete Test Cite', 2);
        `);

		await request(server)
			.delete(
				`/v1/caselists/testcaselist/schools/testschool/teams/testteam/cites/${newCite.insertId}`,
			)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=user'])
			.expect('Content-Type', /json/)
			.expect(200);

		const cites = await query(SQL`
            SELECT COUNT(*) AS 'count' FROM cites WHERE round_id = 1 AND title = 'Delete Test Cite'
        `);
		assert.strictEqual(cites[0].count, 0, 'Cite deleted');

		const history = await query(SQL`
            SELECT COUNT(*) AS 'count' FROM cites_history WHERE round_id = 1 AND title = 'Delete Test Cite'
        `);
		assert.strictEqual(history[0].count, 1, 'Cite history entry');
	});

	it('should return a 400 for a non-existing cite', async () => {
		await request(server)
			.delete(
				`/v1/caselists/testcaselist/schools/testschool/teams/testteam/cites/3`,
			)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=user'])
			.expect('Content-Type', /json/)
			.expect(400);
	});

	it('should return a 403 for an archived cite', async () => {
		await request(server)
			.delete(
				`/v1/caselists/archivedcaselist/schools/archivedschool/teams/archivedteam/cites/3`,
			)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=user'])
			.expect('Content-Type', /json/)
			.expect(403);
	});

	it('should allow an admin to delete archived cites', async () => {
		await request(server)
			.delete(
				`/v1/caselists/archivedcaselist/schools/archivedschool/teams/archivedteam/cites/3`,
			)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=admin'])
			.expect('Content-Type', /json/)
			.expect(200);
	});

	it('should return a 401 with no authorization cookie', async () => {
		await request(server)
			.delete(
				`/v1/caselists/testcaselist/schools/testschool/teams/testteam/cites/1`,
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(401);
	});

	it('should return a 401 for untrusted users', async () => {
		await request(server)
			.delete(
				`/v1/caselists/testcaselist/schools/testschool/teams/testteam/cites/1`,
			)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=untrusted'])
			.expect('Content-Type', /json/)
			.expect(401);
	});

	it('should return a 401 for users who did not create the cite', async () => {
		const newCite = await query(SQL`
            INSERT INTO cites (round_id, title, cites, created_by_id) VALUES
                (1, 'Delete Test Cite', 'Delete Test Cite', 1);
        `);
		await query(SQL`
			UPDATE teams SET created_by_id = 1 WHERE team_id = 1
        `);

		await request(server)
			.delete(
				`/v1/caselists/testcaselist/schools/testschool/teams/testteam/cites/${newCite.insertId}`,
			)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=user'])
			.expect('Content-Type', /json/)
			.expect(401);
	});

	afterEach(async () => {
		await query(SQL`
            DELETE FROM cites WHERE round_id = 1
        `);
		await query(SQL`
            DELETE FROM cites_history WHERE round_id = 1 AND title = 'Delete Test Cite'
        `);
	});
});
