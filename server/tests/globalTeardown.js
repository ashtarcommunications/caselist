import { pool } from '../v1/helpers/mysql';

const globalTeardown = async () => {
    pool.end();
};

export default globalTeardown;
