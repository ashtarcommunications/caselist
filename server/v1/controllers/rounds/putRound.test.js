import { assert } from 'vitest';
import SQL from 'sql-template-strings';
import request from 'supertest';
import fs from 'fs';
import { query } from '../../helpers/mysql.js';
import config from '../../../config.js';
import server from '../../../index.js';

describe('PUT /v1/caselists/{caselist}/schools/{school}/teams/{team}/rounds/{round}', () => {
	beforeEach(async () => {
		await query(SQL`
            UPDATE rounds set opensource = 'testcaselist/testschool/testteam/testschool-testteam-Aff-Test-Update-Round-Round-1.docx' WHERE round_id = 1
        `);
		await query(SQL`DELETE FROM rounds_history WHERE round_id = 1`);
		await fs.promises.mkdir(`${config.UPLOAD_DIR}`, { recursive: true });
		await fs.promises.mkdir(
			`${config.UPLOAD_DIR}/testcaselist/testschool/testteam`,
			{ recursive: true },
		);
		await fs.promises.writeFile(
			`${config.UPLOAD_DIR}/testcaselist/testschool/testteam/testschool-testteam-Aff-Test-Update-Round-Round-1.docx`,
			'test',
		);
	});

	it('should update a round', async () => {
		const round = {
			side: 'N',
			tournament: 'Test Update Round',
			round: '2',
			opponent: 'Update',
			judge: 'Update',
			report: 'Update',
			opensource: 'test',
			video: 'Update',
		};

		await request(server)
			.put(
				`/v1/caselists/testcaselist/schools/testschool/teams/testteam/rounds/1`,
			)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=user'])
			.send(round)
			.expect('Content-Type', /json/)
			.expect(200);

		const updatedRound = await query(SQL`
            SELECT * FROM rounds WHERE round_id = 1
        `);
		assert.strictEqual(updatedRound[0].side, 'N', 'Side updated');
		assert.strictEqual(
			updatedRound[0].tournament,
			'Test Update Round',
			'Tournament updated',
		);
		assert.strictEqual(updatedRound[0].round, '2', 'Side updated');
		assert.strictEqual(updatedRound[0].opponent, 'Update', 'Opponent updated');
		assert.strictEqual(updatedRound[0].judge, 'Update', 'Judge updated');
		assert.strictEqual(updatedRound[0].report, 'Update', 'Report updated');
		assert.strictEqual(
			updatedRound[0].opensource,
			'testcaselist/testschool/testteam/testschool-testteam-Neg-Test-Update-Round-Round-2.docx',
			'Open Source updated',
		);
		assert.strictEqual(updatedRound[0].video, 'Update', 'Video updated');

		const roundsHistory = await query(SQL`
            SELECT COUNT(*) AS 'count' FROM rounds_history WHERE tournament = 'Test Update Round'
        `);
		assert.strictEqual(roundsHistory[0].count, 1, 'Round History inserted');

		try {
			await fs.promises.access(
				`${config.UPLOAD_DIR}/testcaselist/testschool/testteam/testschool-testteam-Neg-Test-Update-Round-Round-2.docx`,
				fs.constants.F_OK,
			);
		} catch (err) {
			assert.isNotOk(err, 'File renamed');
		}
	});

	it('should remove an open source file when updating a round', async () => {
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
			.put(
				`/v1/caselists/testcaselist/schools/testschool/teams/testteam/rounds/1`,
			)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=user'])
			.send(round)
			.expect('Content-Type', /json/)
			.expect(200);

		const updatedRound = await query(SQL`
            SELECT * FROM rounds WHERE round_id = 1
        `);
		assert.strictEqual(updatedRound[0].side, 'N', 'Side updated');
		assert.strictEqual(
			updatedRound[0].tournament,
			'Test Update Round',
			'Tournament updated',
		);
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
			await fs.promises.access(
				`${config.UPLOAD_DIR}/testcaselist/testschool/testteam/testschool-testteam-Aff-Test-Update-Round-Round-1.docx`,
				fs.constants.F_OK,
			);
		} catch (err) {
			assert.isOk(err, 'File deleted');
		}

		try {
			await fs.promises.access(
				`${config.UPLOAD_DIR}/testcaselist/testschool/testteam/testschool-testteam-Aff-Test-Update-Round-Round-1-DELETED-v1.docx`,
				fs.constants.F_OK,
			);
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
			.put(
				`/v1/caselists/testcaselist/schools/testschool/teams/missingteam/rounds/4`,
			)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=user'])
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
			.put(
				`/v1/caselists/archivedcaselist/schools/archivedschool/teams/archivedteam/rounds/3`,
			)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=user'])
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
			.put(
				`/v1/caselists/testcaselist/schools/testschool/teams/testteam/rounds/1`,
			)
			.set('Accept', 'application/json')
			.send(round)
			.expect('Content-Type', /json/)
			.expect(401);
	});

	it('should return a 401 for an untrusted user', async () => {
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
			.put(
				`/v1/caselists/testcaselist/schools/testschool/teams/testteam/rounds/1`,
			)
			.set('Accept', 'application/json')
			.set('Cookie', ['caselist_token=untrusted'])
			.send(round)
			.expect('Content-Type', /json/)
			.expect(401);
	});

	afterEach(async () => {
		try {
			await query(SQL`
                UPDATE rounds set opensource = 'test.docx' WHERE round_id = 1
            `);
			await query(SQL`
                DELETE FROM rounds_history WHERE round_id = 1
            `);
			let files = await fs.promises.readdir(config.UPLOAD_DIR);
			files = files.filter((f) => f.startsWith('testschool-testteam'));
			await Promise.all(
				files.map((f) => fs.promises.rm(`${config.UPLOAD_DIR}/${f}`)),
			);
			await fs.promises.rm(
				`${config.UPLOAD_DIR}/testcaselist/testschool/testteam/testschool-testteam-Aff-Test-Update-Round-Round-1.docx`,
			);
			await fs.promises.rm(
				`${config.UPLOAD_DIR}/testcaselist/testschool/testteam/testschool-testteam-Neg-Test-Update-Round-Round-2.docx`,
			);
		} catch (err) {
			// Do Nothing
		}
	});
});
