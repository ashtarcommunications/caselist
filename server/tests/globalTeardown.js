import { pool } from '../v1/helpers/mysql';

const globalTeardown = () => {
    pool.end();
};

export default globalTeardown;
