import { assert } from 'chai';
import request from 'supertest';
import server from '../../../index';

describe('GET /v1/caselists/{caselist}/schools', () => {
    it('should return a list of schools', async () => {
        const res = await request(server)
            .get(`/v1/caselists/testcaselist/schools`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(200);

        assert.isArray(res.body, 'Response is an array');
        assert.property(res.body[0], 'school_id', 'school_id property');
        assert.property(res.body[0], 'caselist_id', 'caselist_id property');
        assert.property(res.body[0], 'name', 'name property');
        assert.property(res.body[0], 'display_name', 'display_name property');
        assert.property(res.body[0], 'state', 'state property');
        assert.property(res.body[0], 'chapter_id', 'chapter_id property');
        assert.property(res.body[0], 'archived', 'archived property');
    });

    it('should return a 401 with no authorization cookie', async () => {
        await request(server)
            .get(`/v1/caselists/testcaselist/schools`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401);
    });
});
