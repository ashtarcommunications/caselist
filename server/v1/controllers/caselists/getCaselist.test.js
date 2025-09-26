import { assert } from 'vitest';
import request from 'supertest';
import server from '../../../index.js';

describe('GET /v1/caselists/{caselist}', () => {
	it('should return caselist data', async () => {
		const res = await request(server)
			.get(`/v1/caselists/testcaselist`)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=user'])
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isObject(res.body, 'Response is an object');
		assert.property(res.body, 'caselist_id', 'caselist_id property');
		assert.property(res.body, 'name', 'name property');
		assert.property(res.body, 'display_name', 'display_name property');
		assert.property(res.body, 'year', 'year property');
		assert.property(res.body, 'event', 'event property');
		assert.property(res.body, 'level', 'level property');
		assert.property(res.body, 'team_size', 'team_size property');
		assert.property(res.body, 'archived', 'archived property');
	});

	it('should error on invalid parameters', async () => {
		await request(server)
			.get(`/v1/caselists/invalid`)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=user'])
			.expect('Content-Type', /json/)
			.expect(404);
	});

	it('should return a 401 with no authorization cookie', async () => {
		await request(server)
			.get(`/v1/caselists/invalid`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(401);
	});
});
