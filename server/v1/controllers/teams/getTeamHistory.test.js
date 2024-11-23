import { assert } from 'chai';
import request from 'supertest';
import server from '../../../index';

describe('GET /v1/caselists/{caselist}/schools/{school}/teams/{team}/history', () => {
    it('should return a list of history for a team', async () => {
        const res = await request(server)
            .get(`/v1/caselists/testcaselist/schools/testschool/teams/testteam/history`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(200);

        assert.isArray(res.body, 'Response is an array');
        assert.property(res.body[0], 'description', 'description property');
        assert.property(res.body[0], 'updated_by', 'updated_by property');
        assert.property(res.body[0], 'updated_at', 'updated_at property');
    });

    it('should return a 401 with no authorization cookie', async () => {
        await request(server)
            .get(`/v1/caselists/testcaselist/schools/testschool/teams/testteam/history`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401);
    });
});
