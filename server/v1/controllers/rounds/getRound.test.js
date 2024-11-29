import { assert } from 'vitest';
import request from 'supertest';
import server from '../../../index.js';

describe('GET /v1/caselists/{caselist}/schools/{school}/teams/{team}/rounds/{round}', () => {
	it('should return caselist data', async () => {
		const res = await request(server)
			.get(
				`/v1/caselists/testcaselist/schools/testschool/teams/testteam/rounds/1`,
			)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=test'])
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isObject(res.body, 'Response is an object');
		assert.property(res.body, 'round_id', 'round_id property');
		assert.property(res.body, 'team_id', 'team_id property');
		assert.property(res.body, 'side', 'side property');
		assert.property(res.body, 'tournament', 'tournament property');
		assert.property(res.body, 'round', 'round property');
		assert.property(res.body, 'opponent', 'opponent property');
		assert.property(res.body, 'judge', 'judge property');
		assert.property(res.body, 'report', 'report property');
		assert.property(res.body, 'opensource', 'opensource property');
		assert.property(res.body, 'video', 'video property');
		assert.property(res.body, 'tourn_id', 'tourn_id property');
		assert.property(res.body, 'external_id', 'external_id property');
	});

	it('should return a 404 on a missing round', async () => {
		await request(server)
			.get(
				`/v1/caselists/testcaselist/schools/testschool/teams/testteam/rounds/4`,
			)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=test'])
			.expect('Content-Type', /json/)
			.expect(404);
	});

	it('should return a 401 with no authorization cookie', async () => {
		await request(server)
			.get(
				`/v1/caselists/testcaselist/schools/testschool/teams/testteam/rounds/1`,
			)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(401);
	});
});
