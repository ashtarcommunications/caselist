import { assert } from 'chai';
import request from 'supertest';
import server from '../../../index';

describe('GET /v1/caselists/{caselist}/schools/{school}', () => {
    it('should return school data', async () => {
        const res = await request(server)
            .get(`/v1/caselists/testcaselist/schools/testschool`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(200);

        assert.isObject(res.body, 'Response is an object');
        assert.property(res.body, 'school_id', 'school_id property');
        assert.property(res.body, 'caselist_id', 'caselist_id property');
        assert.property(res.body, 'name', 'name property');
        assert.property(res.body, 'display_name', 'display_name property');
        assert.property(res.body, 'state', 'state property');
        assert.property(res.body, 'chapter_id', 'chapter_id property');
        assert.property(res.body, 'archived', 'archived property');
        assert.property(res.body, 'updated_by', 'updated_by property');
    });

    it('should not return updated_by for an archived school', async () => {
        const res = await request(server)
            .get(`/v1/caselists/archivedcaselist/schools/archivedschool`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(200);

        assert.isUndefined(res.body.updated_by);
    });

    it('should return a 404 for a missing school', async () => {
        await request(server)
            .get(`/v1/caselists/testcaselist/schools/missing`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(404);
    });

    it('should return a 401 with no authorization cookie', async () => {
        await request(server)
            .get(`/v1/caselists/testcaselist/schools/testschool`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401);
    });
});
