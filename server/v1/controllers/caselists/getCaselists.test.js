import { assert } from 'chai';
import request from 'supertest';
import server from '../../../index.js';

describe('GET /v1/caselists', () => {
    it('should return a list of caselists optionally archived', async () => {
        let res = await request(server)
            .get(`/v1/caselists?archived=false`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(200);

        assert.isArray(res.body, 'Response is an array');
        assert.strictEqual(res.body.filter(c => c.archived).length, 0, 'No non-archived caselists found');

        res = await request(server)
            .get(`/v1/caselists?archived=true`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(200);

        assert.isArray(res.body, 'Response is an array');
        assert.property(res.body[0], 'caselist_id', 'caselist_id property');
        assert.property(res.body[0], 'name', 'name property');
        assert.property(res.body[0], 'display_name', 'display_name property');
        assert.property(res.body[0], 'year', 'year property');
        assert.property(res.body[0], 'event', 'event property');
        assert.property(res.body[0], 'level', 'level property');
        assert.property(res.body[0], 'team_size', 'team_size property');
        assert.property(res.body[0], 'archived', 'archived property');
    });

    it('should return a 401 with no authorization cookie', async () => {
        await request(server)
            .get(`/v1/caselists`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401);
    });
});
