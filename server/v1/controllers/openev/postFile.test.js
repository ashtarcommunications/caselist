import { assert } from 'chai';
import SQL from 'sql-template-strings';
import request from 'supertest';
import fs from 'fs';
import { startOfYear } from '@speechanddebate/nsda-js-utils';
import { query } from '../../helpers/mysql';
import config from '../../../config';
import server from '../../../index';

describe('POST /v1/openev', () => {
    it('should post an openev file', async () => {
        const body = {
            file: 'AAAA',
            filename: 'test.docx',
            title: 'Test',
            year: startOfYear,
            camp: 'CNDI',
            lab: 'Lab',
        };
        await request(server)
            .post(`/v1/openev`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(body)
            .expect('Content-Type', /json/)
            .expect(201);

        try {
            await fs.promises.access(`${config.UPLOAD_DIR}/openev/${startOfYear}/CNDI/Test - CNDI ${startOfYear} Lab.docx`, fs.constants.F_OK);
        } catch (err) {
            assert.isNotOk(err, 'File uploaded');
        }

        const openev = await query(SQL`
            SELECT * FROM openev WHERE name = 'Test - CNDI ${startOfYear} Lab' AND camp = 'CNDI' AND lab = 'Lab'
        `);
        assert.strictEqual(openev.length, 1, 'OpenEv inserted');
        assert.strictEqual(openev[0].path, `openev/${startOfYear}/CNDI/Test - CNDI ${startOfYear} Lab.docx`, 'Correct path');

        // Should error on duplicate file
        await request(server)
            .post(`/v1/openev`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(body)
            .expect('Content-Type', /json/)
            .expect(400);
    });

    it('should return a 401 with no authorization cookie', async () => {
        const body = {
            file: 'AAAA',
            filename: 'test.docx',
            title: 'Test',
            year: startOfYear,
            camp: 'CNDI',
            lab: 'Lab',
        };
        await request(server)
            .post(`/v1/openev`)
            .set('Accept', 'application/json')
            .send(body)
            .expect('Content-Type', /json/)
            .expect(401);
    });

    afterEach(async () => {
        await query(SQL`
            DELETE FROM openev WHERE name = 'Test - CNDI ${startOfYear} Lab' AND camp = 'CNDI' AND lab = 'Lab'
        `);
        try {
            await fs.promises.rm(`${config.UPLOAD_DIR}/openev/${startOfYear}/CNDI/Test - CNDI ${startOfYear} Lab.docx`);
        } catch {
            // Do nothing
        }
    });
});
