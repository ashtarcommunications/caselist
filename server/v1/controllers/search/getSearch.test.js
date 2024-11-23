import { assert } from 'chai';
import request from 'supertest';
import server from '../../../index.js';
import { searchLimiter } from './getSearch.js';

describe('GET /v1/search', () => {
    it('should return a search', async () => {
        const res = await request(server)
            .get(`/v1/search?shard=test&q=test`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /application/)
            .expect(200);

        assert.isArray(res.body, 'Response is an array');
        assert.property(res.body[0], 'type', 'Type property');
        assert.property(res.body[0], 'path', 'Path property');
        assert.property(res.body[0], 'caselist', 'Caselist property');
        assert.property(res.body[0], 'caselist_display_name', 'Caselist Display Name property');
        assert.property(res.body[0], 'school', 'School property');
        assert.property(res.body[0], 'school_display_name', 'School Display Name property');
        assert.property(res.body[0], 'team', 'Team property');
        assert.property(res.body[0], 'team_display_name', 'Team Display Name property');
    });

    it('should return a 429 on too many searches', async () => {
        const tries = [0, 1, 2, 3, 4];
        // eslint-disable-next-line no-restricted-syntax
        for (const i of tries) {
            let statusCode = 200;
            if (i === 4) { statusCode = 429; }
            // eslint-disable-next-line no-await-in-loop
            await request(server)
                .get(`/v1/search?shard=test&q=test`)
                .set('Accept', 'application/json')
                .set('Cookie', ['caselist_token=test'])
                .expect('Content-Type', /application/)
                .expect(statusCode);
        }
    });

    it('should return a 400 for an invalid query', async () => {
        await request(server)
            .get(`/v1/search?q=!!!`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(400);
    });

    it('should return a 401 with no authorization cookie', async () => {
        await request(server)
            .get(`/v1/search?shard=test&q=test`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401);
    });

    afterEach(async () => {
        searchLimiter.resetKey(1);
    });
});
