import { authenticate } from 'ldap-authentication';
import crypto from 'crypto';
import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';
import config from '../../../config';
import { debugLogger } from '../../helpers/logger';

const postLogin = {
    POST: async (req, res) => {
        const username = req.body.username.trim();
        const password = req.body.password;
        const remember = req.body.remember;

        const ldapErrors = {
            ECONNREFUSED: 'Failed to connect to Tabroom',
            ERR_ASSERTION: 'Failed to provide username and password',
            ENOTFOUND: 'Failed to connect to Tabroom',
            49: 'Invalid username or password',
            80: 'Failed to connect to Tabroom',
        };

        let auth = authenticate;

        if (process.env.NODE_ENV !== 'production') {
            auth = () => {
                return {
                    dn: 'uid=test@test.com,ou=users,dc=tabroom,dc=com',
                    uidNumber: 1,
                    displayName: 'Test User',
                };
            };
        }

        let user;
        try {
            user = await auth({
                ldapOpts: { url: config.LDAP_URL },
                userDn: `uid=${username},ou=users,dc=tabroom,dc=com`,
                userPassword: password,
                userSearchBase: 'ou=users,dc=tabroom,dc=com',
                usernameAttribute: 'uid',
                username,
            });
        } catch (err) {
            debugLogger.info(`LDAP error ${err.code}: ${err}`);
            return res.status(401).json({ message: ldapErrors[err.code] || 'Error connecting to Tabroom' });
        }

        if (!user || !user.uidNumber) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const nonce = crypto.randomBytes(16).toString('hex');
        const hash = crypto.createHash('sha256').update(nonce).digest('hex');

        await query(SQL`
            INSERT INTO users (user_id, email, display_name)
            VALUES (${user.uidNumber}, ${username}, ${user.displayName})
            ON DUPLICATE KEY UPDATE email=${username}, display_name=${user.displayName}
        `);

        await query(SQL`
            INSERT INTO sessions (token, user_id, ip, expires_at)
            VALUES (${hash}, ${user.uidNumber}, ${req.ip}, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 2 WEEK))
        `);

        // Expire cookies in 2 weeks if "remember me" is checked, otherwise default to session cookie
        // Express sets maxAge in milliseconds, not seconds
        res.cookie('caselist_token', nonce, { maxAge: remember ? (1000 * 60 * 60 * 24 * 14) : undefined, httpOnly: false, path: '/', sameSite: 'Lax' });

        if (config.ADMINS?.includes(user.uidNumber)) {
            res.cookie('caselist_admin', true, { maxAge: remember ? (1000 * 60 * 60 * 24 * 14) : undefined, httpOnly: false, path: '/', sameSite: 'Lax' });
        }

        return res.status(201).json({ message: 'Successfully logged in', token: nonce });
    },
};

postLogin.POST.apiDoc = {
    summary: 'Logs in',
    operationId: 'postLogin',
    requestBody: {
        description: 'The username and password',
        required: true,
        content: { '*/*': { schema: { $ref: '#/components/schemas/Login' } } },
    },
    responses: {
        201: {
            description: 'Logged in',
            content: { '*/*': { schema: { $ref: '#/components/schemas/Login' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [],
};

export default postLogin;
