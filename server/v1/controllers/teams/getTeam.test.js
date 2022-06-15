import { assert } from 'chai';
import request from 'supertest';
import server from '../../../index';

describe('GET /v1/caselists/{caselist}/schools/{school}/teams/{team}', () => {
    it('should return team data', async () => {
        const res = await request(server)
            .get(`/v1/caselists/testcaselist/schools/testschool/teams/testteam`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(200);

        assert.isObject(res.body, 'Response is an object');
        assert.property(res.body, 'team_id', 'team_id property');
        assert.property(res.body, 'school_id', 'school_id property');
        assert.property(res.body, 'name', 'name property');
        assert.property(res.body, 'display_name', 'display_name property');
        assert.property(res.body, 'notes', 'notes property');
        assert.property(res.body, 'debater1_first', 'debater1_first property');
        assert.property(res.body, 'debater1_last', 'debater1_last property');
        assert.property(res.body, 'debater2_first', 'debater2_first property');
        assert.property(res.body, 'debater2_last', 'debater2_last property');
        assert.property(res.body, 'debater3_first', 'debater3_first property');
        assert.property(res.body, 'debater3_last', 'debater3_last property');
        assert.property(res.body, 'debater4_first', 'debater4_first property');
        assert.property(res.body, 'debater4_last', 'debater4_last property');
        assert.property(res.body, 'archived', 'archived property');
        assert.property(res.body, 'updated_by', 'updated_by property');
    });

    it('should anonymize names and not return updated_by for an archived team', async () => {
        const res = await request(server)
            .get(`/v1/caselists/archivedcaselist/schools/archivedschool/teams/archivedteam`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(200);

        assert.isUndefined(res.body.updated_by);
        assert.isTrue(res.body.debater1_first.includes('...'), 'Debater first anonymized');
        assert.isTrue(res.body.debater1_last.includes('...'), 'Debater last anonymized');
    });

    it('should return a 404 for a missing team', async () => {
        await request(server)
            .get(`/v1/caselists/testcaselist/schools/testschool/teams/missing`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(404);
    });

    it('should return a 401 with no authorization cookie', async () => {
        await request(server)
            .get(`/v1/caselists/testcaselist/schools/testschool/teams/testteam`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401);
    });
});
