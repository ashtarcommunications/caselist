import testFixtures from './testFixtures.js';
import testTeardown from './testTeardown.js';
import { pool } from '../v1/helpers/mysql.js';

export const setup = async () => {
	await testFixtures();
};

export const teardown = async () => {
	await testTeardown();
	await pool.end();
};
