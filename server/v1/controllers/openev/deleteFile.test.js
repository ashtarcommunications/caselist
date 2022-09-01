import { assert } from 'chai';
import fs from 'fs';
import SQL from 'sql-template-strings';
import request from 'supertest';
import { startOfYear } from '@speechanddebate/nsda-js-utils';
import { query } from '../../helpers/mysql';
import config from '../../../config';
import server from '../../../index';

describe('DELETE /v1/openev/{openev_id}', () => {
    beforeEach(async () => {
        await fs.promises.mkdir(`${config.UPLOAD_DIR}/openev`, { recursive: true });
        await fs.promises.writeFile(`${config.UPLOAD_DIR}/openev/test`, 'test');
    });

    it('should delete an openev file', async () => {
        const newFile = await query(SQL`
            INSERT INTO openev (name, path, year, camp, lab, tags) VALUES
                ('test', 'openev/test', ${startOfYear}, 'Test', 'BB', '{"da":true,"cp":true}');
        `);

        await request(server)
            .delete(`/v1/openev/${newFile.insertId}`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(200);

        const files = await query(SQL`
            SELECT COUNT(*) AS 'count' FROM openev WHERE name = 'openev/test'
        `);
        assert.strictEqual(files[0].count, 0, 'File entry deleted');

        try {
            await fs.promises.access(`${config.UPLOAD_DIR}/openev/test`, fs.constants.F_OK);
        } catch (err) {
            assert.isOk(err, 'File deleted');
        }
    });

    it('should return a 400 for a non-existing file', async () => {
        await request(server)
            .delete(`/v1/openev/3`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(400);
    });

    it('should return a 403 for an archived file', async () => {
        await request(server)
            .delete(`/v1/openev/2`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(403);
    });

    it('should return a 401 for a non-admin', async () => {
        await request(server)
            .delete(`/v1/openev/1`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=user'])
            .expect('Content-Type', /json/)
            .expect(401);
    });

    it('should return a 401 without a cookie', async () => {
        await request(server)
            .delete(`/v1/openev/1`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401);
    });

    afterEach(async () => {
        try {
            await fs.promises.rm(`${config.UPLOAD_DIR}/openev/test`);
        } catch (err) {
            // Do nothing
        }
        await query(SQL`
            DELETE FROM openev WHERE path = 'openev/test'
        `);
    });
});
