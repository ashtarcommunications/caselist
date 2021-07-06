import { debugLogger } from './logger';

const auth = async (req) => {
    let authorized = false;

    const err = new Error('Not Authorized');
    err.status = 401;

    // Bypass auth for now
    authorized = true;

    if (authorized) { return authorized; }

    // Default to unauthorized
    debugLogger.error(`Authorization failed: ${err.message}`);
    throw err;
};

export default auth;
