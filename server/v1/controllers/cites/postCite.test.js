import { assert } from 'chai';
import SQL from 'sql-template-strings';
import request from 'supertest';
import { query } from '../../helpers/mysql';
import server from '../../../index';

describe('POST /v1/caselists/{caselist}/schools/{school}/teams/{team}/cites', () => {
    it('should post a cite', async () => {
        const cite = {
            round_id: 1,
            title: 'Post Test Cite',
            cites: '# Post Test Cite',
        };
        await request(server)
            .post(`/v1/caselists/testcaselist/schools/testschool/teams/testteam/cites`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(cite)
            .expect('Content-Type', /json/)
            .expect(201);

        const newCite = await query(SQL`
            SELECT COUNT(*) AS 'count' FROM cites WHERE title = 'Post Test Cite' AND round_id = 1
        `);
        assert.strictEqual(newCite[0].count, 1, 'Cite inserted');

        const history = await query(SQL`
            SELECT COUNT(*) AS 'count' FROM cites_history WHERE title = 'Post Test Cite' AND round_id = 1
        `);
        assert.strictEqual(history[0].count, 1, 'Cite History inserted');
    });

    it('should return a 400 for a non-existing round', async () => {
        const cite = {
            round_id: 3,
            title: 'Missing round',
            cites: 'Missing round',
        };
        await request(server)
            .post(`/v1/caselists/testcaselist/schools/testschool/teams/testteam/cites`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(cite)
            .expect('Content-Type', /json/)
            .expect(400);
    });

    it('should return a 403 for an archived round', async () => {
        const cite = {
            round_id: 3,
            title: 'Post Test Cite',
            cites: '# Post Test Cite',
        };
        await request(server)
            .post(`/v1/caselists/archivedcaselist/schools/archivedschool/teams/archivedteam/cites`)
            .set('Accept', 'application/json')
            .set('Cookie', ['caselist_token=test'])
            .send(cite)
            .expect('Content-Type', /json/)
            .expect(403);
    });

    it('should return a 401 with no authorization cookie', async () => {
        const cite = {
            round_id: 1,
            title: 'Post Test Cite',
            cites: '# Post Test Cite',
        };
        await request(server)
            .post(`/v1/caselists/testcaselist/schools/testschool/teams/testteam/cites`)
            .set('Accept', 'application/json')
            .send(cite)
            .expect('Content-Type', /json/)
            .expect(401);
    });

    afterEach(async () => {
        await query(SQL`
            DELETE FROM cites WHERE round_id = 1 AND title = 'Post Test Cite'
        `);
        await query(SQL`
            DELETE FROM cites_history WHERE round_id = 1 AND title = 'Post Test Cite'
        `);
    });
});
