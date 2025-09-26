import { assert } from 'vitest';
import request from 'supertest';
import server from '../../../index.js';

describe('GET /v1/tabroom/students', () => {
	it('should return a list of students', async () => {
		const res = await request(server)
			.get(`/v1/tabroom/students`)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=user'])
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isArray(res.body, 'Response is an array');
		assert.property(res.body[0], 'id', 'id property');
		assert.property(res.body[0], 'first', 'first property');
		assert.property(res.body[0], 'last', 'last property');
		assert.property(res.body[0], 'name', 'name property');
	});

	it('should return a 401 with no authorization cookie', async () => {
		await request(server)
			.get(`/v1/tabroom/students`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(401);
	});
});
