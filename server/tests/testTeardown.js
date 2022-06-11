import SQL from 'sql-template-strings';
import { query } from '../v1/helpers/mysql';

const testTeardown = async () => {
    await query(SQL`DELETE FROM openev WHERE openev_id < 10`);
    await query(SQL`DELETE FROM cites WHERE cite_id < 10`);
    await query(SQL`DELETE FROM cites_history WHERE cite_id < 10`);
    await query(SQL`DELETE FROM rounds WHERE round_id < 10`);
    await query(SQL`DELETE FROM rounds_history WHERE round_id < 10`);
    await query(SQL`DELETE FROM teams WHERE team_id < 10`);
    await query(SQL`DELETE FROM teams_history WHERE team_id < 10`);
    await query(SQL`DELETE FROM schools WHERE school_id < 10`);
    await query(SQL`DELETE FROM schools_history WHERE school_id < 10`);
    await query(SQL`DELETE FROM caselists WHERE caselist_id < 10`);
    await query(SQL`DELETE FROM sessions WHERE session_id < 10 OR user_id < 10`);
    await query(SQL`DELETE FROM users WHERE user_id < 10`);
};

export default testTeardown;
