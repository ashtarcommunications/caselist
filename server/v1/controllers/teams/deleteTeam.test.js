import { assert } from 'chai';
import SQL from 'sql-template-strings';
import request from 'supertest';
import fs from 'fs';
import { query } from '../../helpers/mysql';
import config from '../../../config';
import server from '../../../index';

describe('DELETE /v1/caselists/{caselist}/schools/{school}/teams/{team}/rounds/{round}', () => {
    beforeEach(async () => {
        await fs.promises.mkdir(`${config.UPLOAD_DIR}`, { recursive: true });
        await fs.promises.writeFile(`${config.UPLOAD_DIR}/test.docx`, 'test');
    });

    it('should delete a round', async () => {
        const newTeam = await query(SQL`
            INSERT INTO teams (school_id, name, display_name, debater1_first, debater1_last) VALUES
                (1, 'deleteteam', 'Test Delete Team', 'Test', 'Test');
        `);
        const newRound = await query(SQL`
            INSERT INTO rounds (team_id, tournament, side, round, opensource) VALUES
                (${newTeam.insertId}, 'TestDelete', 'A', '1', 'test.docx');
        `);
        await query(SQL`
            INSERT INTO cites (round_id, title, cites) VALUES
                (${newRound.insertId}, 'TestDelete', 'TestDelete');
        `);

        await request(server)
            .delete(`/v1/caselists/testcaselist/schools/testschool/teams/deleteteam`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(200);

        const teams = await query(SQL`
            SELECT COUNT(*) AS 'count' FROM teams WHERE team_id = ${newTeam.insertId}
        `);
        assert.strictEqual(teams[0].count, 0, 'Team deleted');

        const rounds = await query(SQL`
            SELECT COUNT(*) AS 'count' FROM rounds WHERE round_id = ${newRound.insertId}
        `);
        assert.strictEqual(rounds[0].count, 0, 'Round deleted');

        const cites = await query(SQL`
            SELECT COUNT(*) AS 'count' FROM cites WHERE round_id = ${newRound.insertId}
        `);
        assert.strictEqual(cites[0].count, 0, 'Cite deleted');

        const teamsHistory = await query(SQL`
            SELECT * FROM teams_history WHERE team_id = ${newTeam.insertId}
        `);
        assert.strictEqual(teamsHistory.length, 1, 'Team history entry');

        const roundsHistory = await query(SQL`
            SELECT * FROM rounds_history WHERE round_id = ${newRound.insertId}
        `);
        assert.strictEqual(roundsHistory.length, 1, 'Round history entry');

        const citesHistory = await query(SQL`
            SELECT COUNT(*) AS 'count' FROM cites_history WHERE round_id = ${newRound.insertId}
        `);
        assert.strictEqual(citesHistory[0].count, 1, 'Cite history entry');

        try {
            await fs.promises.access(`${config.UPLOAD_DIR}/test.docx`, fs.constants.F_OK);
        } catch (err) {
            assert.isOk(err, 'File deleted');
        }

        try {
            await fs.promises.access(`${config.UPLOAD_DIR}/test-DELETED-v${roundsHistory[0].version}.docx`, fs.constants.F_OK);
        } catch (err) {
            assert.isNotOk(err, 'No error accessing deleted file');
        }
    });

    it('should return a 400 for a non-existing team', async () => {
        await request(server)
            .delete(`/v1/caselists/testcaselist/schools/testschool/teams/missingteam`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(400);
    });

    it('should return a 403 for an archived school', async () => {
        await request(server)
            .delete(`/v1/caselists/archivedcaselist/schools/archivedschool/teams/archivedteam`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .expect('Content-Type', /json/)
            .expect(403);
    });

    it('should return a 401 with no authorization cookie', async () => {
        await request(server)
            .delete(`/v1/caselists/testcaselist/schools/testschool/teams/deleteteam`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401);
    });

    it('should return a 401 for an untrusted user', async () => {
        await request(server)
            .delete(`/v1/caselists/testcaselist/schools/testschool/teams/deleteteam`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=untrusted'])
            .expect('Content-Type', /json/)
            .expect(401);
    });

    afterEach(async () => {
        try {
            let files = await fs.promises.readdir(config.UPLOAD_DIR);
            files = files.filter(f => f.startsWith('test'));
            await Promise.all(files.map(f => fs.promises.rm(`${config.UPLOAD_DIR}/${f}`)));
        } catch (err) {
            // Do Nothing
        }
        await query(SQL`
            DELETE FROM teams_history WHERE school_id = 1
        `);
        await query(SQL`
            DELETE FROM rounds_history WHERE tournament = 'TestDelete'
        `);
        await query(SQL`
            DELETE FROM cites_history WHERE title = 'TestDelete' and cites = 'TestDelete'
        `);
    });
});
