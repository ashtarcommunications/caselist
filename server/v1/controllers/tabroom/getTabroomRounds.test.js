import { assert } from 'chai';
import request from 'supertest';
import server from '../../../index';

describe('GET /v1/tabroom/rounds', () => {
    it('should return a list of rounds for a slug', async () => {
        const res = await request(server)
            .get(`/v1/tabroom/rounds?slug=/test`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(200);

        assert.isArray(res.body, 'Response is an array');
        assert.property(res.body[0], 'id', 'id property');
        assert.property(res.body[0], 'tournament', 'tournament property');
        assert.property(res.body[0], 'round', 'round property');
        assert.property(res.body[0], 'side', 'side property');
        assert.property(res.body[0], 'opponent', 'opponent property');
        assert.property(res.body[0], 'judge', 'judge property');
        assert.property(res.body[0], 'start_time', 'start_time property');
    });

    it('should return a list of rounds for a person', async () => {
        const res = await request(server)
            .get(`/v1/tabroom/rounds`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(200);

        assert.isArray(res.body, 'Response is an array');
        assert.property(res.body[0], 'id', 'id property');
        assert.property(res.body[0], 'tournament', 'tournament property');
        assert.property(res.body[0], 'round', 'round property');
        assert.property(res.body[0], 'side', 'side property');
        assert.property(res.body[0], 'opponent', 'opponent property');
        assert.property(res.body[0], 'judge', 'judge property');
        assert.property(res.body[0], 'start_time', 'start_time property');
    });

    it('should return a 401 with no authorization cookie', async () => {
        await request(server)
            .get(`/v1/tabroom/rounds?slug=/test`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401);
    });
});
