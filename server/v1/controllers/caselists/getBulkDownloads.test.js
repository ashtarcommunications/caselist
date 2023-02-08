import { assert } from 'chai';
import request from 'supertest';
import fs from 'fs';
import config from '../../../config';
import server from '../../../index';

describe('GET /v1/caselists/{caselist}/downloads', () => {
    beforeEach(async () => {
        await fs.promises.mkdir(`${config.UPLOAD_DIR}/weekly/testcaselist`, { recursive: true });
        await fs.promises.writeFile(`${config.UPLOAD_DIR}/weekly/testcaselist/downloadtest.zip`, 'test');
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
        assert.property(res.body[0], 'path', 'path property');
    });

    it('should return a 500 with a non-existent caeslist', async () => {
        await request(server)
            .get(`/v1/caselists/missing/downloads`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(500);
    });

    it('should return a 401 with no authorization cookie', async () => {
        await request(server)
            .get(`/v1/caselists/testcaselist/downloads`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401);
    });

    afterEach(async () => {
        await fs.promises.rm(`${config.UPLOAD_DIR}/weekly/testcaselist`, { recursive: true, force: true });
    });
});
