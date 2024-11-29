import { assert } from 'vitest';
import request from 'supertest';
import server from '../../../index.js';

describe('GET /v1/tabroom/chapters', () => {
	it('should return a list of chapters', async () => {
		const res = await request(server)
			.get(`/v1/tabroom/chapters`)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=test'])
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isArray(res.body, 'Response is an array');
		assert.property(res.body[0], 'id', 'id property');
		assert.property(res.body[0], 'name', 'name property');
		assert.property(res.body[0], 'state', 'state property');
	});

	it('should return a 401 with no authorization cookie', async () => {
		await request(server)
			.get(`/v1/tabroom/chapters`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(401);
	});
});
