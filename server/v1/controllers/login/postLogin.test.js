import { assert } from 'chai';
import request from 'supertest';
import server from '../../../index';

describe('POST /v1/login', () => {
    it('should login', async () => {
        const body = {
            username: 'test@test.com',
            password: 'test',
        };
        const res = await request(server)
            .post(`/v1/login`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(body)
            .expect('Content-Type', /json/)
            .expect(201);

        assert.property(res.body, 'token', 'Token property');
        assert.property(res.body, 'admin', 'Admin property');
    });
});
