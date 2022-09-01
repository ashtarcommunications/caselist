import { assert } from 'chai';
import SQL from 'sql-template-strings';
import request from 'supertest';
import fs from 'fs';
import { query } from '../../helpers/mysql';
import config from '../../../config';
import server from '../../../index';

describe('PUT /v1/caselists/{caselist}/schools/{school}/teams/{team}/rounds/{round}', () => {
    beforeEach(async () => {
        await fs.promises.mkdir(`${config.UPLOAD_DIR}`, { recursive: true });
        await fs.promises.writeFile(`${config.UPLOAD_DIR}/test.docx`, 'test');
    });

    it('should update a round', async () => {
        const round = {
            side: 'N',
            tournament: 'Test Update Round',
            round: '2',
            opponent: 'Update',
            judge: 'Update',
            report: 'Update',
            opensource: null,
            video: 'Update',
        };

        await request(server)
            .put(`/v1/caselists/testcaselist/schools/testschool/teams/testteam/rounds/1`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(round)
            .expect('Content-Type', /json/)
            .expect(200);

        const updatedRound = await query(SQL`
            SELECT * FROM rounds WHERE round_id = 1
        `);
        assert.strictEqual(updatedRound[0].side, 'N', 'Side updated');
        assert.strictEqual(updatedRound[0].tournament, 'Test Update Round', 'Tournament updated');
        assert.strictEqual(updatedRound[0].round, '2', 'Side updated');
        assert.strictEqual(updatedRound[0].opponent, 'Update', 'Opponent updated');
        assert.strictEqual(updatedRound[0].judge, 'Update', 'Judge updated');
        assert.strictEqual(updatedRound[0].report, 'Update', 'Report updated');
        assert.strictEqual(updatedRound[0].opensource, null, 'Open Source updated');
        assert.strictEqual(updatedRound[0].video, 'Update', 'Video updated');

        const roundsHistory = await query(SQL`
            SELECT COUNT(*) AS 'count' FROM rounds_history WHERE tournament = 'Test Update Round'
        `);
        assert.strictEqual(roundsHistory[0].count, 1, 'Round History inserted');

        try {
            await fs.promises.access(`${config.UPLOAD_DIR}/test.docx`, fs.constants.F_OK);
        } catch (err) {
            assert.isOk(err, 'File deleted');
        }

        try {
            await fs.promises.access(`${config.UPLOAD_DIR}/test-DELETED-v1.docx`, fs.constants.F_OK);
        } catch (err) {
            assert.isNotOk(err, 'File renamed');
        }
    });

    it('should return a 404 for a non-existing round', async () => {
        const round = {
            side: 'N',
            tournament: 'Test Update Round',
            round: '2',
            opponent: 'Update',
            judge: 'Update',
            report: 'Update',
            opensource: null,
            video: 'Update',
        };

        await request(server)
            .put(`/v1/caselists/testcaselist/schools/testschool/teams/missingteam/rounds/4`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(round)
            .expect('Content-Type', /json/)
            .expect(404);
    });

    it('should return a 403 for an archived team', async () => {
        const round = {
            side: 'N',
            tournament: 'Test Update Round',
            round: '2',
            opponent: 'Update',
            judge: 'Update',
            report: 'Update',
            opensource: null,
            video: 'Update',
        };
        await request(server)
            .put(`/v1/caselists/archivedcaselist/schools/archivedschool/teams/archivedteam/rounds/3`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(round)
            .expect('Content-Type', /json/)
            .expect(403);
    });

    it('should return a 401 with no authorization cookie', async () => {
        const round = {
            side: 'N',
            tournament: 'Test Update Round',
            round: '2',
            opponent: 'Update',
            judge: 'Update',
            report: 'Update',
            opensource: null,
            video: 'Update',
        };
        await request(server)
            .put(`/v1/caselists/testcaselist/schools/testschool/teams/testteam/rounds/1`)
            .set('Accept', 'application/json')
            .send(round)
            .expect('Content-Type', /json/)
            .expect(401);
    });

    afterAll(async () => {
        try {
            let files = await fs.promises.readdir(config.UPLOAD_DIR);
            files = files.filter(f => f.startsWith('test'));
            await Promise.all(files.map(f => fs.promises.rm(`${config.UPLOAD_DIR}/${f}`)));
        } catch (err) {
            // Do Nothing
        }
    });
});
