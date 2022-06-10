import { pool } from '../v1/helpers/mysql';

afterAll(async () => {
    await pool.end();
});
