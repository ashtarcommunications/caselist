import crypto from 'crypto';
import SQL from 'sql-template-strings';
import { query } from './mysql';
import { debugLogger } from './logger';

const auth = async (req) => {
    const hash = crypto.createHash('sha512').update(req.cookies.caselist_token).digest('hex');
    const sql = (SQL`
        SELECT * FROM sessions WHERE token = ${hash}
    `);
    const session = await query(sql);
    if (session && session.length > 0) {
        req.user_id = session[0].user_id;
        return true;
    }

    // Default to unauthorized
    const err = new Error('Not Authorized');
    err.status = 401;
    debugLogger.error(`Authorization failed: ${err.message}`);
    throw err;
};

export default auth;
