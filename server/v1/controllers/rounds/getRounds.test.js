import { assert } from 'chai';
import request from 'supertest';
import server from '../../../index.js';

describe('GET /v1/caselists/{caselist}/schools/{school}/teams/{team}/rounds', () => {
    it('should return a list of rounds optionally filtered by side', async () => {
        let res = await request(server)
            .get(`/v1/caselists/testcaselist/schools/testschool/teams/testteam/rounds`)
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
        assert.property(res.body[0], 'judge', 'judge property');
        assert.property(res.body[0], 'report', 'report property');
        assert.property(res.body[0], 'opensource', 'opensource property');
        assert.property(res.body[0], 'video', 'video property');
        assert.property(res.body[0], 'tourn_id', 'tourn_id property');
        assert.property(res.body[0], 'external_id', 'external_id property');

        res = await request(server)
            .get(`/v1/caselists/testcaselist/schools/testschool/teams/testteam/rounds?side=A`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(200);

        assert.isArray(res.body, 'Response is an array');
        assert.strictEqual(res.body.filter(r => r.side !== 'A').length, 0, 'No non-Aff rounds');
    });

    it('should return a 401 with no authorization cookie', async () => {
        await request(server)
            .get(`/v1/caselists/testcaselist/schools/testschool/teams/testteam/rounds`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401);
    });
});
