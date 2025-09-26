import request from 'supertest';
import server from '../../../index.js';

describe('POST /v1/tabroom/link', () => {
	it('should create a Tabroom link', async () => {
		const body = {
			slug: '/testcaselist/test',
		};

		await request(server)
			.post(`/v1/tabroom/link`)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=user'])
			.send(body)
			.expect('Content-Type', /json/)
			.expect(201);
	});

	it('should return a 400 for an invalid url', async () => {
		const body = {
			slug: '/test',
		};

		await request(server)
			.post(`/v1/tabroom/link`)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=user'])
			.send(body)
			.expect('Content-Type', /json/)
			.expect(400);
	});

	it('should return a 401 with no authorization cookie', async () => {
		const body = {
			slug: '/testcaselist/test',
		};

		await request(server)
			.post(`/v1/tabroom/link`)
			.set('Accept', 'application/json')
			.send(body)
			.expect('Content-Type', /json/)
			.expect(401);
	});

	it('should return a 401 for an untrusted user', async () => {
		const body = {
			slug: '/testcaselist/test',
		};

		await request(server)
			.post(`/v1/tabroom/link`)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=untrusted'])
			.send(body)
			.expect('Content-Type', /json/)
			.expect(401);
	});
});
