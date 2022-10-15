import { assert } from 'chai';
import SQL from 'sql-template-strings';
import request from 'supertest';
import fs from 'fs';
import { query } from '../../helpers/mysql';
import config from '../../../config';
import server from '../../../index';

describe('POST /v1/caselists/{caselist}/schools/{school}/teams/{team}/rounds', () => {
    it('should post a round', async () => {
        const round = {
            side: 'A',
            tournament: 'Test Post Round',
            round: '1',
            opponent: 'Test',
            judge: 'Test',
            report: 'Test',
            opensource: 'AAAA',
            filename: 'Test.docx',
            video: 'Test',
            cites: [{ title: 'Test Post Round', cites: 'Test Post Round' }],
        };

        await request(server)
            .post(`/v1/caselists/testcaselist/schools/testschool/teams/testteam/rounds`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(round)
            .expect('Content-Type', /json/)
            .expect(201);

        const newRound = await query(SQL`
            SELECT COUNT(*) AS 'count' FROM rounds WHERE tournament = 'Test Post Round'
        `);
        assert.strictEqual(newRound[0].count, 1, 'Round inserted');

        const roundsHistory = await query(SQL`
            SELECT COUNT(*) AS 'count' FROM rounds_history WHERE tournament = 'Test Post Round'
        `);
        assert.strictEqual(roundsHistory[0].count, 1, 'Round History inserted');

        try {
            await fs.promises.access(`${config.UPLOAD_DIR}/testcaselist/testschool/testteam/testschool-testteam-Aff-Test-Post-Round-Round-1.docx`, fs.constants.F_OK);
        } catch (err) {
            assert.isNotOk(err, 'File uploaded');
        }

        const newCite = await query(SQL`
            SELECT COUNT(*) AS 'count' FROM cites WHERE title = 'Test Post Round'
        `);
        assert.strictEqual(newCite[0].count, 1, 'Cite inserted');

        const citesHistory = await query(SQL`
            SELECT COUNT(*) AS 'count' FROM cites_history WHERE title = 'Test Post Round'
        `);
        assert.strictEqual(citesHistory[0].count, 1, 'Cite History inserted');
    }, 10000);

    it('should return a 400 for a non-existing team', async () => {
        const round = {
            side: 'A',
            tournament: 'Test Post Round',
            round: '1',
            opponent: 'Test',
            judge: 'Test',
            report: 'Test',
            opensource: 'AAAA',
            filename: 'Test.docx',
            video: 'Test',
        };
        await request(server)
            .post(`/v1/caselists/testcaselist/schools/testschool/teams/missingteam/rounds`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(round)
            .expect('Content-Type', /json/)
            .expect(400);
    }, 10000);

    it('should return a 403 for an archived team', async () => {
        const round = {
            side: 'A',
            tournament: 'Test Post Round',
            round: '1',
            opponent: 'Test',
            judge: 'Test',
            report: 'Test',
            opensource: 'AAAA',
            filename: 'Test.docx',
            video: 'Test',
        };
        await request(server)
            .post(`/v1/caselists/archivedcaselist/schools/archivedschool/teams/archivedteam/rounds`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(round)
            .expect('Content-Type', /json/)
            .expect(403);
    }, 10000);

    it('should return a 401 with no authorization cookie', async () => {
        const round = {
            side: 'A',
            tournament: 'Test Post Round',
            round: '1',
            opponent: 'Test',
            judge: 'Test',
            report: 'Test',
            opensource: 'AAAA',
            filename: 'Test.docx',
            video: 'Test',
        };
        await request(server)
            .post(`/v1/caselists/testcaselist/schools/testschool/teams/testteam/rounds`)
            .set('Accept', 'application/json')
            .send(round)
            .expect('Content-Type', /json/)
            .expect(401);
    });

    afterEach(async () => {
        await query(SQL`
            DELETE FROM cites WHERE title = 'Test Post Round'
        `);
        await query(SQL`
            DELETE FROM cites_history WHERE title = 'Test Post Round'
        `);
        await query(SQL`
            DELETE FROM rounds WHERE tournament = 'Test Post Round'
        `);
        await query(SQL`
            DELETE FROM rounds_history WHERE tournament = 'Test Post Round'
        `);
        try {
            await fs.promises.rm(`${config.UPLOAD_DIR}/testcaselist/testschool/testteam/testschool-testteam-Aff-Test-Post-Round-Round-1.docx`);
        } catch (err) {
            // Do nothing
        }
    }, 30000);
});
