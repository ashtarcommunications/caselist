import { assert } from 'chai';
import request from 'supertest';
import server from '../../../index.js';

describe('GET /v1/caselists/{caselist}/recent', () => {
    it('should return a list of recent modifications for a caselist', async () => {
        const res = await request(server)
            .get(`/v1/caselists/testcaselist/recent`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(200);

        assert.isArray(res.body, 'Response is an array');
        assert.property(res.body[0], 'round_id', 'round_id property');
        assert.property(res.body[0], 'team_id', 'team_id property');
        assert.property(res.body[0], 'side', 'side property');
        assert.property(res.body[0], 'tournament', 'tournament property');
        assert.property(res.body[0], 'round', 'round property');
        assert.property(res.body[0], 'opponent', 'opponent property');
        assert.property(res.body[0], 'opensource', 'opensource property');
        assert.property(res.body[0], 'team_name', 'team_name property');
        assert.property(res.body[0], 'team_display_name', 'team_display_name property');
        assert.property(res.body[0], 'school_name', 'school_name property');
        assert.property(res.body[0], 'school_display_name', 'school_display_name property');
        assert.property(res.body[0], 'updated_at', 'updated_at property');
    });

    it('should return a 401 with no authorization cookie', async () => {
        await request(server)
            .get(`/v1/caselists/testcaselist/recent`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401);
    });
});
