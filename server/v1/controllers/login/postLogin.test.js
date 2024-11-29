import { assert } from 'vitest';
import request from 'supertest';
import server from '../../../index.js';

describe('POST /v1/login', () => {
	it('should login', async () => {
		const body = {
			username: 'test@test.com',
			password: 'test',
		};
		const res = await request(server)
			.post(`/v1/login`)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=test'])
			.send(body)
			.expect('Content-Type', /json/)
			.expect(201);

		assert.property(res.body, 'token', 'Token property');
		assert.property(res.body, 'expires', 'Expires property');
		assert.property(res.body, 'trusted', 'Trusted property');
		assert.property(res.body, 'admin', 'Admin property');
	});

	it('should return a 429 on too many login attempts', async () => {
		const tries = [
			0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
		];
		const body = {
			username: 'test@test.com',
			password: 'test',
		};
		// eslint-disable-next-line no-restricted-syntax
		for (const i of tries) {
			let statusCode = 201;
			if (i === 19) {
				statusCode = 429;
			}
			// eslint-disable-next-line no-await-in-loop
			await request(server)
				.post(`/v1/login`)
				.set('Accept', 'application/json')
				.set('Cookie', ['caselist_token=test'])
				.send(body)
				.expect('Content-Type', /application/)
				.expect(statusCode);
		}
	});
});
