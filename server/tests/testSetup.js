/* eslint-disable no-undef */
import testFixtures from './testFixtures.js';
import testTeardown from './testTeardown.js';
import { pool } from '../v1/helpers/mysql.js';

beforeEach(async () => {
	await testFixtures();
});

afterEach(async () => {
	await testTeardown();
});

afterAll(async () => {
	await pool.end();
});
