import request from 'supertest';
import server from '../../../index';

describe('POST /v1/tabroom/link', () => {
    it('should create a Tabroom link', async () => {
        const body = {
            slug: '/test',
        };

        await request(server)
            .post(`/v1/tabroom/link`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(body)
            .expect('Content-Type', /json/)
            .expect(201);
    });

    it('should return a 401 with no authorization cookie', async () => {
        const body = {
            slug: '/test',
        };

        await request(server)
            .post(`/v1/tabroom/link`)
            .set('Accept', 'application/json')
            .send(body)
            .expect('Content-Type', /json/)
            .expect(401);
    });
});
