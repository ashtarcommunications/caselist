/* eslint-disable no-underscore-dangle */
/* istanbul ignore file */
import express from 'express';
import cron from 'node-cron';
import helmet from 'helmet';
import rateLimiter from 'express-rate-limit';
import slowDown from 'express-slow-down';
import uuid from 'uuid/v4.js';
import expressWinston from 'express-winston';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { initialize } from 'express-openapi';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config.js';
import apiDoc from './v1/routes/api-doc.js';
import paths from './v1/routes/paths.js';
import errorHandler from './v1/helpers/error.js';
import auth from './v1/helpers/auth.js';
import {
	debugLogger,
	requestLogger,
	errorLogger,
} from './v1/helpers/logger.js';
import { setupMocks } from './tests/mocks.js';
import { deleteIndex } from './v1/controllers/search/deleteIndex.js';
import { buildIndex } from './v1/controllers/search/buildIndex.js';
import { weeklyArchives } from './v1/controllers/download/weeklyArchives.js';
import { deleteSessions } from './v1/controllers/login/deleteSessions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Startup log message
debugLogger.info('Initializing API...');

// Use mocks for external fetch requests in dev/test
if (process.env.NODE_ENV !== 'production') {
	setupMocks();
}

// Optionally rebuild Solr index on startup, normally want to keep existing index
// Also run a cron job to add new files/cites to Solr every hour
if (config.REBUILD_SOLR) {
	try {
		await deleteIndex();
		// Rebuild the index async so server can start up, reindex takes a while
		buildIndex(false, false);
	} catch (err) {
		debugLogger.error(err.message);
	}
}
if (process.env.NODE_ENV !== 'test') {
	cron.schedule('5 * * * *', async () => {
		debugLogger.info('Ingesting recent files and cites into Solr...');
		try {
			await buildIndex(false, true);
		} catch (err) {
			debugLogger.error(err.message);
		}
	});

	// Create weekly archive at midnight on Tuesdays
	cron.schedule('0 0 * * 2', async () => {
		debugLogger.info('Creating weekly open source archives...');
		try {
			await weeklyArchives(false);
		} catch (err) {
			debugLogger.error(err.message);
		}
	});

	// Clear deleted sessions every hour
	cron.schedule('7 * * * *', async () => {
		try {
			await deleteSessions();
		} catch (err) {
			debugLogger.error(err.message);
		}
	});
}

// Enable Helmet security
app.use(helmet());

// Enable getting forwarded client IP from proxy
app.enable('trust proxy');

// Enable CORS
app.use((req, res, next) => {
	// Can't use wildcard for CORS with credentials, so echo back the requesting domain
	const allowedOrigin = req.get('Origin') || '*';
	res.header('Access-Control-Allow-Origin', allowedOrigin);
	res.header('Access-Control-Allow-Credentials', true);
	res.header(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, PATCH, DELETE, OPTIONS',
	);
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization',
	);
	res.header('Access-Control-Max-Age', 86400);
	res.header('Access-Control-Expose-Headers', 'Content-Disposition');
	next();
});

// Add a unique UUID to every request
app.use((req, res, next) => {
	req.uuid = uuid();
	return next();
});

// Log all requests
app.use(
	expressWinston.logger({
		winstonInstance: requestLogger,
		meta: true,
		dynamicMeta: (req) => {
			return {
				logCorrelationId: req.uuid,
			};
		},
	}),
);

// Slow down requests before they hit the rate limiter
const speedLimiter = slowDown({
	windowMs: config.SLOWDOWN_RATE_WINDOW || 15 * 60 * 1000, // 15 minutes
	delayAfter: config.SLOWDOWN_RATE_AFTER || 1500, // Allow 1500 requests per 15 minutes
	delayMs: config.SLOWDOWN_RATE_DELAY || 50, // Add 50ms of delay per request above 1500
	maxDelayMs: config.SLOWDOWN_MAX_DELAY || 10000, // Cap max delay at 10s per request
	keyGenerator: (req) => (req.user_id ? req.user_id : req.ip),
	skip: (req) =>
		req.method === 'OPTIONS' ||
		process.env.NODE_ENV === 'test' ||
		config.ADMINS?.includes(req.user_id),
});

// Rate limit all requests
const getLimiter = rateLimiter({
	windowMs: config.GET_RATE_WINDOW || 15 * 60 * 1000, // 15 minutes
	max: config.GET_RATE_MAX || 2000, // limit each user to 2000 requests per windowMs
	keyGenerator: (req) => (req.user_id ? req.user_id : req.ip),
	handler: (req, res) => {
		debugLogger.info(
			`2000 requests/15m rate limit enforced on user ${req.user_id || req.ip}`,
		);
		res.status(429).send({
			message:
				'You have exceeded the allowed number of page views per 15 minutes. Wait and try again.',
		});
	},
	skip: (req) =>
		req.method === 'OPTIONS' ||
		process.env.NODE_ENV === 'test' ||
		config.ADMINS?.includes(req.user_id),
});

// Rate limit modification requests to prevent abuse
const modificationLimiter = rateLimiter({
	windowMs: config.MODIFICATION_RATE_WINDOW || 60 * 1000, // 1 minute
	max: config.MODIFICATION_RATE_MAX || 5, // limit each user to 5 modifications/minute
	keyGenerator: (req) => (req.user_id ? req.user_id : req.ip),
	handler: (req, res) => {
		debugLogger.info(
			`5 modifications/1m rate limit enforced on user ${req.user_id || req.ip}`,
		);
		res.status(429).send({
			message:
				'You have exceeded the allowed number of modifications per minute. Wait and try again.',
		});
	},
	skip: (req) =>
		req.method === 'OPTIONS' ||
		req.method === 'GET' ||
		process.env.NODE_ENV === 'test' ||
		config.ADMINS?.includes(req.user_id) ||
		req.url?.includes('/login'),
});

// Super rate limit modification requests to stop bot abuse
const superModificationLimiter = rateLimiter({
	windowMs: config.SUPER_MODIFICATION_RATE_WINDOW || 1440 * 60 * 1000, // 1 day
	max: config.SUPER_MODIFICATION_RATE_MAX || 250, // limit each user to 250 modifications/day
	keyGenerator: (req) => (req.user_id ? req.user_id : req.ip),
	message: {
		message: 'You have exceeded the allowed number of modifications per day',
	},
	handler: (req, res) => {
		debugLogger.info(
			`250 modifications/1d rate limit enforced on user ${req.user_id || req.ip}`,
		);
		res.status(429).send({
			message:
				'You have exceeded the allowed number of modifications per day. Wait and try again.',
		});
	},
	skip: (req) =>
		req.method === 'OPTIONS' ||
		req.method === 'GET' ||
		process.env.NODE_ENV === 'test' ||
		config.ADMINS?.includes(req.user_id) ||
		req.url?.includes('/login'),
});

// Parse body and cookies
app.use(
	bodyParser.json({ type: ['json', 'application/*json'], limit: '10mb' }),
);
app.use(bodyParser.text({ type: '*/*', limit: '10mb' }));
app.use(cookieParser());

// Initialize OpenAPI middleware - have to add rate limiters here to have access to user info
initialize({
	app,
	apiDoc: {
		...apiDoc,
		'x-express-openapi-additional-middleware': [
			speedLimiter,
			getLimiter,
			modificationLimiter,
			superModificationLimiter,
		],
	},
	paths,
	docsPath: '/docs',
	promiseMode: true,
	errorMiddleware: errorHandler,
	securityHandlers: {
		cookie: auth,
	},
});

// Log global errors with Winston
app.use(
	expressWinston.errorLogger({
		winstonInstance: errorLogger,
		meta: true,
		dynamicMeta: (req) => {
			return {
				logCorrelationId: req.uuid,
			};
		},
	}),
);

app.use(express.static(path.join(__dirname, '../client/build')));
app.get('/', (req, res) => {
	return res.sendFile(path.join(`${__dirname}/client/build/index.html`));
});

// Final fallback error handling
app.use(errorHandler);

// Start server
const port = process.env.PORT || config.PORT || 10010;
if (process.env.NODE_ENV !== 'test') {
	app.listen(port, () => {
		debugLogger.info(`server started. listening on port ${port}`);
	});
}

export default app;
