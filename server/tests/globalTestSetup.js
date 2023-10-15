import testFixtures from './testFixtures';
import testTeardown from './testTeardown';
import { pool } from '../v1/helpers/mysql';

export const setup = async () => {
    await testFixtures();
};

export const teardown = async () => {
    await testTeardown();
    await pool.end();
};
