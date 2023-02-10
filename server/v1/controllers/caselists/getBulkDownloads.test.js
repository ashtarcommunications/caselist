import { assert } from 'chai';
import request from 'supertest';
import AWS from 'aws-sdk-mock';
import server from '../../../index';

describe('GET /v1/caselists/{caselist}/downloads', () => {
    beforeEach(async () => {
        AWS.mock('S3', 'listObjectsV2', { Contents: [{ Key: 'weekly/testcaselist/all.zip' }, { Key: 'weekly/testcaselist/weekly.zip' }] });
    });

    it('should return a list of bulk downloads for a caselist', async () => {
        const res = await request(server)
            .get(`/v1/caselists/testcaselist/downloads`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
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

    afterEach(async () => {
        AWS.restore('S3');
    });
});
