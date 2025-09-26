import crypto from 'crypto';
import SQL from 'sql-template-strings';
import rateLimiter from 'express-rate-limit';
import { query } from '../../helpers/mysql.js';
import config from '../../../config.js';
import { debugLogger } from '../../helpers/logger.js';

export const loginLimiter = rateLimiter({
	windowMs: 60 * 1000, // 1 minute
	max: 20, // limit each user to 20 login attempts/minute
	keyGenerator: (req) => (req.user_id ? req.user_id : req.ip),
	handler: (req, res) => {
		debugLogger.info(
			`20 login attempts/1m rate limit enforced on user ${req.user_id || req.ip}`,
		);
		res.status(429).send({
			message:
				'You can only attempt to login 20 times per minute. Wait and try again.',
		});
	},
	skip: (req) => req.method === 'OPTIONS',
});

const postLogin = {
	POST: async (req, res) => {
		const username = req.body.username.trim();
		const { password } = req.body;
		const { remember } = req.body;

		let user;
		if (process.env.NODE_ENV !== 'production') {
			user = { person_id: 1, name: 'Test User', trusted: true };
		} else {
			try {
				const url = `${config.TABROOM_API_URL}/login`;
				const base64 = Buffer.from(
					`${config.TABROOM_API_USER_ID}:${config.TABROOM_API_KEY}`,
				).toString('base64');

				const response = await fetch(url, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Basic ${base64}`,
					},
					body: JSON.stringify({ username, password }),
				});
				user = await response.json();
			} catch (err) {
				debugLogger.error(`Error connecting to Tabroom: ${err}`);
				return res.status(500).json({
					message:
						'Error logging in via Tabroom, the authentication service may not be responding',
				});
			}
		}

		if (!user || !user.person_id || user.error) {
			return res.status(401).json({
				message:
					"Invalid username or password - if sure they're correct, try resetting password on Tabroom",
			});
		}

		const nonce = crypto.randomBytes(16).toString('hex');
		const hash = crypto.createHash('sha256').update(nonce).digest('hex');

		await query(SQL`
            INSERT INTO users (user_id, email, display_name, trusted)
            VALUES (${user.person_id}, ${username}, ${user.name}, ${user.trusted ? 1 : 0})
            ON DUPLICATE KEY UPDATE email=${username}, display_name=${user.name}, trusted=${user.trusted ? 1 : 0}
        `);

		await query(SQL`
            INSERT INTO sessions (token, user_id, ip, expires_at)
            VALUES (${hash}, ${user.person_id}, ${req.ip}, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 2 WEEK))
        `);

		const [admin] = await query(SQL`
			SELECT admin FROM users WHERE user_id = ${user.person_id}
        `);

		// Expire cookies in 2 weeks if "remember me" is checked and account is trusted,
		// otherwise default to session cookie
		// Express sets maxAge in milliseconds, not seconds
		res.cookie('caselist_token', nonce, {
			maxAge: remember && user.trusted ? 1000 * 60 * 60 * 24 * 14 : undefined,
			httpOnly: false,
			path: '/',
			sameSite: 'Lax',
			domain: config.COOKIE_DOMAIN,
		});

		if (user.trusted) {
			res.cookie('caselist_trusted', true, {
				maxAge: remember && user.trusted ? 1000 * 60 * 60 * 24 * 14 : undefined,
				httpOnly: false,
				path: '/',
				sameSite: 'Lax',
				domain: config.COOKIE_DOMAIN,
			});
		}

		if (admin?.admin || config.ADMINS?.includes(parseInt(user.person_id))) {
			res.cookie('caselist_admin', true, {
				maxAge: remember && user.trusted ? 1000 * 60 * 60 * 24 * 14 : undefined,
				httpOnly: false,
				path: '/',
				sameSite: 'Lax',
				domain: config.COOKIE_DOMAIN,
			});
		}

		let expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
		expires = expires.toISOString();

		return res.status(201).json({
			message: 'Successfully logged in',
			token: nonce,
			expires,
			trusted: user.trusted,
			admin: admin?.admin || config.ADMINS?.includes(parseInt(user.person_id)),
		});
	},
	'x-express-openapi-additional-middleware': [loginLimiter],
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
