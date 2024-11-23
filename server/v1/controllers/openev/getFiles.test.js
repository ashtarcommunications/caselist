import { assert } from 'chai';
import request from 'supertest';
import server from '../../../index.js';

describe('GET /v1/openev', () => {
    it('should return a list of open ev files', async () => {
        const res = await request(server)
            .get(`/v1/openev`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(200);

        assert.isArray(res.body, 'Response is an array');
        assert.property(res.body[0], 'openev_id', 'caselist_id property');
        assert.property(res.body[0], 'name', 'name property');
        assert.property(res.body[0], 'path', 'path property');
        assert.property(res.body[0], 'year', 'year property');
        assert.property(res.body[0], 'camp', 'camp property');
        assert.property(res.body[0], 'lab', 'lab property');
        assert.property(res.body[0], 'tags', 'tags property');
    });

    it('should filter openev by year', async () => {
        const res = await request(server)
            .get(`/v1/openev?year=2021`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(200);

        assert.isArray(res.body, 'Response is an array');
    });

    it('should return a 401 with no authorization cookie', async () => {
        await request(server)
            .get(`/v1/openev`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401);
    });
});
