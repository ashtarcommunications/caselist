import { assert } from 'vitest';
import request from 'supertest';
import server from '../../../index.js';

describe('GET /v1/caselists/{caselist}/schools/{school}/teams/{team}/cites', () => {
	it('should return a list of cites', async () => {
		const res = await request(server)
			.get(`/v1/caselists/testcaselist/schools/testschool/teams/testteam/cites`)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=user'])
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isArray(res.body, 'Response is an array');
		assert.property(res.body[0], 'cite_id', 'cite_id property');
		assert.property(res.body[0], 'round_id', 'round_id property');
		assert.property(res.body[0], 'title', 'title property');
		assert.property(res.body[0], 'cites', 'cites property');
		assert.property(res.body[0], 'created_at', 'created_at property');
		assert.property(res.body[0], 'created_by_id', 'created_by_id property');
		assert.property(res.body[0], 'updated_at', 'updated_at property');
		assert.property(res.body[0], 'updated_by_id', 'updated_by_id property');
		assert.property(res.body[0], 'side', 'side property');
		assert.property(res.body[0], 'tournament', 'tournament property');
		assert.property(res.body[0], 'round', 'round property');
		assert.property(res.body[0], 'opponent', 'opponent property');
		assert.property(res.body[0], 'judge', 'judge property');
	});

	it('should filter cites to a side', async () => {
		const res = await request(server)
			.get(
				`/v1/caselists/testcaselist/schools/testschool/teams/testteam/cites?side=A`,
			)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=user'])
			.expect('Content-Type', /json/)
			.expect(200);

		assert.strictEqual(
			res.body.filter((c) => c.side === 'N').length,
			0,
			'No neg cites',
		);
	});

	it('should return a 401 with no authorization cookie', async () => {
		await request(server)
			.get(`/v1/caselists/testcaselist/schools/testschool/teams/testteam/cites`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(401);
	});
});
