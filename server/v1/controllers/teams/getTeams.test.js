import { assert } from 'vitest';
import request from 'supertest';
import server from '../../../index.js';

describe('GET /v1/caselists/{caselist}/schools/{school}/teams', () => {
	it('should return a list of teams', async () => {
		const res = await request(server)
			.get(`/v1/caselists/testcaselist/schools/testschool/teams`)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=test'])
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isArray(res.body, 'Response is an array');
		assert.property(res.body[0], 'team_id', 'team_id property');
		assert.property(res.body[0], 'name', 'name property');
		assert.property(res.body[0], 'display_name', 'display_name property');
		assert.property(res.body[0], 'notes', 'notes property');
		assert.property(res.body[0], 'debater1_first', 'debater1_first property');
		assert.property(res.body[0], 'debater1_last', 'debater1_last property');
		assert.property(res.body[0], 'debater2_first', 'debater2_first property');
		assert.property(res.body[0], 'debater2_last', 'debater2_last property');
		assert.property(res.body[0], 'debater3_first', 'debater3_first property');
		assert.property(res.body[0], 'debater3_last', 'debater3_last property');
		assert.property(res.body[0], 'debater4_first', 'debater4_first property');
		assert.property(res.body[0], 'debater4_last', 'debater4_last property');
		assert.property(res.body[0], 'archived', 'archived property');
	});

	it('should anonymize names, updated_by, and notes for an archived team', async () => {
		const res = await request(server)
			.get(`/v1/caselists/archivedcaselist/schools/archivedschool/teams`)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=test'])
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isTrue(
			res.body[0].debater1_first.includes('...'),
			'Debater first anonymized',
		);
		assert.isTrue(
			res.body[0].debater1_last.includes('...'),
			'Debater last anonymized',
		);

		assert.isUndefined(res.body[0].updated_by);
		assert.isUndefined(res.body[0].notes);
	});

	it('should return a 401 with no authorization cookie', async () => {
		await request(server)
			.get(`/v1/caselists/testcaselist/schools/testschool/teams`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(401);
	});
});
