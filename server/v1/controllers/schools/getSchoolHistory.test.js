import { assert } from 'vitest';
import request from 'supertest';
import server from '../../../index.js';

describe('GET /v1/caselists/{caselist}/schools/{school}/history', () => {
	it('should return a list of history for a school', async () => {
		const res = await request(server)
			.get(`/v1/caselists/testcaselist/schools/testschool/history`)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=user'])
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isArray(res.body, 'Response is an array');
		assert.property(res.body[0], 'description', 'description property');
		assert.property(res.body[0], 'updated_by', 'updated_by property');
		assert.property(res.body[0], 'updated_at', 'updated_at property');
	});

	it('should return a 401 with no authorization cookie', async () => {
		await request(server)
			.get(`/v1/caselists/testcaselist/schools/testschool/history`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(401);
	});
});
