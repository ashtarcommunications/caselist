import { assert } from 'chai';
import SQL from 'sql-template-strings';
import request from 'supertest';
import { query } from '../../helpers/mysql.js';
import server from '../../../index.js';

describe('PATCH /v1/caselists/{caselist}/schools/{school}/teams/{team}', () => {
    it('should update team notes', async () => {
        const update = [{ notes: 'update' }];

        await request(server)
            .patch(`/v1/caselists/testcaselist/schools/testschool/teams/testteam`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(update)
            .expect('Content-Type', /json/)
            .expect(200);

        const updatedTeam = await query(SQL`
            SELECT notes FROM teams WHERE team_id = 1
        `);
        assert.strictEqual(updatedTeam[0].notes, 'update', 'Notes updated');

        const teamsHistory = await query(SQL`
            SELECT COUNT(*) AS 'count' FROM teams_history WHERE team_id = 1 AND notes = 'update'
        `);
        assert.strictEqual(teamsHistory[0].count, 1, 'Team History inserted');
    });

    it('should return a 400 for an invalid update operation', async () => {
        const update = [{ invalid: 'update' }];

        await request(server)
            .patch(`/v1/caselists/testcaselist/schools/testschool/teams/testteam`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(update)
            .expect('Content-Type', /json/)
            .expect(400);
    });

    it('should return a 400 for a non-existing team', async () => {
        const update = [{ notes: 'update' }];

        await request(server)
            .patch(`/v1/caselists/testcaselist/schools/testschool/teams/missingteam`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(update)
            .expect('Content-Type', /json/)
            .expect(400);
    });

    it('should return a 403 for an archived team', async () => {
        const update = [{ notes: 'update' }];

        await request(server)
            .patch(`/v1/caselists/archivedcaselist/schools/archivedschool/teams/archivedteam`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(update)
            .expect('Content-Type', /json/)
            .expect(403);
    });

    it('should return a 401 with no authorization cookie', async () => {
        const update = [{ notes: 'update' }];

        await request(server)
            .patch(`/v1/caselists/testcaselist/schools/testschool/teams/testteam`)
            .set('Accept', 'application/json')
            .send(update)
            .expect('Content-Type', /json/)
            .expect(401);
    });

    it('should return a 401 for an untrusted user', async () => {
        const update = [{ notes: 'update' }];

        await request(server)
            .patch(`/v1/caselists/testcaselist/schools/testschool/teams/testteam`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=untrusted'])
            .send(update)
            .expect('Content-Type', /json/)
            .expect(401);
    });

    afterEach(async () => {
        await query(SQL`
            DELETE FROM teams_history WHERE team_id = 1 AND event <> 'test'
        `);
    });
});
