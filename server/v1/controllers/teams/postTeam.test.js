import { assert } from 'chai';
import SQL from 'sql-template-strings';
import request from 'supertest';
import { query } from '../../helpers/mysql.js';
import server from '../../../index.js';

describe('POST /v1/caselists/{caselist}/schools/{school}/teams', () => {
    it('should post a team', async () => {
        const team = {
            debater1_first: 'Test',
            debater1_last: 'Test',
            debater2_first: 'Test',
            debater2_last: 'Test',
            debater3_first: 'Test',
            debater3_last: 'Test',
            debater4_first: 'Test',
            debater4_last: 'Test',
        };

        await request(server)
            .post(`/v1/caselists/testcaselist/schools/testschool/teams`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(team)
            .expect('Content-Type', /json/)
            .expect(201);

        const newTeam = await query(SQL`
            SELECT * FROM teams WHERE school_id = 1 AND name = 'TeTeTeTe'
        `);
        assert.strictEqual(newTeam[0].name, 'TeTeTeTe', 'Team name');
        assert.strictEqual(newTeam[0].display_name, 'Test School TeTeTeTe', 'Display name');
        assert.strictEqual(newTeam[0].debater1_first, 'Test', 'Debater 1 First');
        assert.strictEqual(newTeam[0].debater1_last, 'Test', 'Debater 1 Last');
        assert.strictEqual(newTeam[0].debater2_first, 'Test', 'Debater 2 First');
        assert.strictEqual(newTeam[0].debater2_last, 'Test', 'Debater 2 Last');
        assert.strictEqual(newTeam[0].debater3_first, 'Test', 'Debater 3 First');
        assert.strictEqual(newTeam[0].debater3_last, 'Test', 'Debater 3 Last');
        assert.strictEqual(newTeam[0].debater4_first, 'Test', 'Debater 4 First');
        assert.strictEqual(newTeam[0].debater4_last, 'Test', 'Debater 4 Last');

        const teamsHistory = await query(SQL`
            SELECT COUNT(*) AS 'count' FROM teams_history WHERE name = 'TeTeTeTe' and school_id = 1
        `);
        assert.strictEqual(teamsHistory[0].count, 1, 'Team History inserted');

        // Should add a number to a duplicate team
        await request(server)
            .post(`/v1/caselists/testcaselist/schools/testschool/teams`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(team)
            .expect('Content-Type', /json/)
            .expect(201);
        const duplicateTeam = await query(SQL`
            SELECT * FROM teams WHERE school_id = 1 AND name = 'TeTeTeTe1'
        `);
        assert.strictEqual(duplicateTeam.length, 1, 'Duplicate team inserted');
    });

    it('should use first and last names for LD', async () => {
        await query(SQL`
            UPDATE caselists SET event = 'ld', team_size = 1 WHERE caselist_id = 1
        `);

        const team = {
            debater1_first: 'First',
            debater1_last: 'Last',
        };

        await request(server)
            .post(`/v1/caselists/testcaselist/schools/testschool/teams`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(team)
            .expect('Content-Type', /json/)
            .expect(201);

        const newTeam = await query(SQL`
            SELECT * FROM teams WHERE school_id = 1 AND name = 'FiLa'
        `);
        assert.strictEqual(newTeam[0].name, 'FiLa', 'Team name');
        assert.strictEqual(newTeam[0].display_name, 'Test School FiLa', 'Display name');
    });

    it('should post general and novice teams', async () => {
        let team = {
            debater1_first: 'All',
            debater1_last: 'Teams',
        };

        await request(server)
            .post(`/v1/caselists/testcaselist/schools/testschool/teams`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(team)
            .expect('Content-Type', /json/)
            .expect(201);

        const newAllTeam = await query(SQL`
            SELECT * FROM teams WHERE school_id = 1 AND display_name = 'Test School All Teams'
        `);
        assert.strictEqual(newAllTeam.length, 1, 'All Teams exists');

        team = {
            debater1_first: 'All',
            debater1_last: 'Novices',
        };

        await request(server)
            .post(`/v1/caselists/testcaselist/schools/testschool/teams`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(team)
            .expect('Content-Type', /json/)
            .expect(201);

        const newNoviceTeam = await query(SQL`
            SELECT * FROM teams WHERE school_id = 1 AND display_name = 'Test School Novices'
        `);
        assert.strictEqual(newNoviceTeam.length, 1, 'Novice Team exists');
    });

    it('should return a 400 on a missing school', async () => {
        const team = {
            debater1_first: 'Test',
            debater1_last: 'Test',
        };

        await request(server)
            .post(`/v1/caselists/testcaselist/schools/missing/teams`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(team)
            .expect('Content-Type', /json/)
            .expect(400);
    });

    it('should return a 403 for an archived school', async () => {
        const team = {
            debater1_first: 'Test',
            debater1_last: 'Test',
        };

        await request(server)
            .post(`/v1/caselists/archivedcaselist/schools/archivedschool/teams`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(team)
            .expect('Content-Type', /json/)
            .expect(403);
    });

    it('should return a 401 with no authorization cookie', async () => {
        const team = {
            debater1_first: 'Test',
            debater1_last: 'Test',
        };

        await request(server)
            .post(`/v1/caselists/testcaselist/schools/testschool/teams`)
            .set('Accept', 'application/json')
            .send(team)
            .expect('Content-Type', /json/)
            .expect(401);
    });

    it('should return a 401 for an untrusted user', async () => {
        const team = {
            debater1_first: 'Test',
            debater1_last: 'Test',
        };

        await request(server)
            .post(`/v1/caselists/testcaselist/schools/testschool/teams`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=untrusted'])
            .send(team)
            .expect('Content-Type', /json/)
            .expect(401);
    });

    afterEach(async () => {
        await query(SQL`
            UPDATE caselists SET event = 'cx', team_size = 2 WHERE caselist_id = 1
        `);
        await query(SQL`
            DELETE FROM teams WHERE (name LIKE 'TeTeTeTe%' OR name IN('TeTeTeTe', 'FiLa', 'All', 'Novices')) AND school_id = 1
        `);
        await query(SQL`
            DELETE FROM teams_history WHERE (name LIKE 'TeTeTeTe%' OR name IN('TeTeTeTe', 'FiLa', 'All', 'Novices')) AND school_id = 1 AND event <> 'test'
        `);
    });
});
