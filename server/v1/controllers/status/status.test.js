import request from 'supertest';
import server from '../../../index';

describe('status', () => {
    describe('ALL /v1/status', () => {
        it('should respond with 200 OK on GET', async () => {
            await request(server)
                .get('/v1/status')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200);
        });

        it('should respond with 200 OK on POST', async () => {
            await request(server)
                .post('/v1/status')
                .set('Accept', 'application/json')
                .send({})
                .expect('Content-Type', /json/)
                .expect(200);
        });

        it('should respond with 200 OK on PUT', async () => {
            await request(server)
                .put('/v1/status')
                .set('Accept', 'application/json')
                .send({})
                .expect('Content-Type', /json/)
                .expect(200);
        });

        it('should respond with 200 OK on PATCH', async () => {
            await request(server)
                .patch('/v1/status')
                .set('Accept', 'application/json')
                .send({})
                .expect('Content-Type', /json/)
                .expect(200);
        });

        it('should respond with 200 OK on DELETE', async () => {
            await request(server)
                .delete('/v1/status')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200);
        });
    });
});
