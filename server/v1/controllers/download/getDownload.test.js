import request from 'supertest';
import fs from 'fs';
import config from '../../../config';
import server from '../../../index';
import { downloadLimiter } from './getDownload';

describe('GET /v1/download', () => {
    beforeEach(async () => {
        await fs.promises.writeFile(`${config.UPLOAD_DIR}/test`, 'test');
    });

    it('should return a download', async () => {
        await request(server)
            .get(`/v1/download?path=test`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /application/)
            .expect(200);
    });

    it('should return a 429 on too many downloads', async () => {
        await fs.promises.writeFile(`${config.UPLOAD_DIR}/test`, 'test');

        const tries = [0, 1, 2, 3, 4, 5];
        // eslint-disable-next-line no-restricted-syntax
        for (const i of tries) {
            let statusCode = 200;
            if (i === 5) { statusCode = 429; }
            // eslint-disable-next-line no-await-in-loop
            await request(server)
                .get(`/v1/download?path=test`)
                .set('Accept', 'application/json')
                .set('Cookie', ['caselist_token=test'])
                .expect('Content-Type', /application/)
                .expect(statusCode);
        }
    });

    it('should return a 404 for a missing file', async () => {
        await request(server)
            .get(`/v1/download?path=invalid`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(404);
    });

    it('should return a 401 with no authorization cookie', async () => {
        await request(server)
            .get(`/v1/download?path=test`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401);
    });

    afterEach(async () => {
        await fs.promises.rm(`${config.UPLOAD_DIR}/test`);
        downloadLimiter.resetKey(1);
    });
});
