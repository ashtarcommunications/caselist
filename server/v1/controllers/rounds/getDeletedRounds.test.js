import { assert } from 'chai';
import request from 'supertest';
import server from '../../../index';

describe('GET /v1/caselists/{caselist}/schools/{school}/teams/{team}/rounds', () => {
    it('should return a list of rounds optionally filtered by side', async () => {
        let res = await request(server)
            .get(`/v1/caselists/testcaselist/schools/testschool/teams/testteam/deletedRounds`)
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
    });

    it('should return a 401 with no authorization cookie', async () => {
        await request(server)
            .get(`/v1/caselists/testcaselist/schools/testschool/teams/testteam/deletedRounds`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401);
    });
});
