import { assert } from 'vitest';
import request from 'supertest';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import server from '../../../index.js';

describe('GET /v1/caselists/{caselist}/downloads', () => {
	let s3Mock;

	beforeAll(async () => {
		s3Mock = mockClient(S3Client);
		s3Mock.on(ListObjectsV2Command).resolves({
			Contents: [
				{ Key: 'weekly/testcaselist/all.zip' },
				{ Key: 'weekly/testcaselist/weekly.zip' },
			],
		});
	});

	it('should return a list of bulk downloads for a caselist', async () => {
		const res = await request(server)
			.get(`/v1/caselists/testcaselist/downloads`)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=user'])
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isArray(res.body, 'Response is an array');
		assert.property(res.body[0], 'name', 'name property');
		assert.property(res.body[0], 'url', 'path property');
	});

	it('should return a 401 with no authorization cookie', async () => {
		await request(server)
			.get(`/v1/caselists/testcaselist/downloads`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(401);
	});

	afterAll(async () => {
		s3Mock.reset();
		s3Mock.restore();
	});
});
