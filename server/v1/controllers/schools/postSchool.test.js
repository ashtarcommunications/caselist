import { assert } from 'vitest';
import SQL from 'sql-template-strings';
import request from 'supertest';
import { query } from '../../helpers/mysql.js';
import server from '../../../index.js';

describe('POST /v1/caselists/{caselist}/schools', () => {
	it('should post a school', async () => {
		const school = {
			displayName: 'Test Post School',
			state: 'CO',
			chapter_id: 1,
		};

		await request(server)
			.post(`/v1/caselists/testcaselist/schools`)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=test'])
			.send(school)
			.expect('Content-Type', /json/)
			.expect(201);

		const newSchool = await query(SQL`
            SELECT * FROM schools WHERE display_name = 'Test Post School'
        `);
		assert.strictEqual(newSchool[0].name, 'TestPostSchool', 'School name');
		assert.strictEqual(
			newSchool[0].display_name,
			'Test Post School',
			'School display name',
		);
		assert.strictEqual(newSchool[0].state, 'CO', 'School state');
		assert.strictEqual(newSchool[0].chapter_id, 1, 'School chapter_id');

		const schoolsHistory = await query(SQL`
            SELECT COUNT(*) AS 'count' FROM schools_history WHERE display_name = 'Test Post School'
        `);
		assert.strictEqual(schoolsHistory[0].count, 1, 'School History inserted');

		// Should 400 on a duplicate school
		await request(server)
			.post(`/v1/caselists/testcaselist/schools`)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=test'])
			.send(school)
			.expect('Content-Type', /json/)
			.expect(400);
	});

	it('should return a 400 on an invalid caselist', async () => {
		const school = {
			displayName: 'Test Post School',
			state: 'CO',
			chapter_id: 1,
		};
		await request(server)
			.post(`/v1/caselists/invalid/schools`)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=test'])
			.send(school)
			.expect('Content-Type', /json/)
			.expect(400);
	});

	it('should return a 403 for an archived caselist', async () => {
		const school = {
			displayName: 'Test Post School',
			state: 'CO',
			chapter_id: 1,
		};
		await request(server)
			.post(`/v1/caselists/archivedcaselist/schools`)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=test'])
			.send(school)
			.expect('Content-Type', /json/)
			.expect(403);
	});

	it('should return a 401 with no authorization cookie', async () => {
		const school = {
			displayName: 'Test Post School',
			state: 'CO',
			chapter_id: 1,
		};
		await request(server)
			.post(`/v1/caselists/testcaselist/schools`)
			.set('Accept', 'application/json')
			.send(school)
			.expect('Content-Type', /json/)
			.expect(401);
	});

	it('should return a 401 for an untrusted user', async () => {
		const school = {
			displayName: 'Test Post School',
			state: 'CO',
			chapter_id: 1,
		};
		await request(server)
			.post(`/v1/caselists/testcaselist/schools`)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=untrusted'])
			.send(school)
			.expect('Content-Type', /json/)
			.expect(401);
	});

	afterEach(async () => {
		await query(SQL`
            DELETE FROM schools WHERE display_name = 'Test Post School'
        `);
		await query(SQL`
            DELETE FROM schools_history WHERE display_name = 'Test Post School'
        `);
	});
});
