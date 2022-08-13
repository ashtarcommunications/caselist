import fs from 'fs';
import rateLimiter from 'express-rate-limit';
import { debugLogger } from '../../helpers/logger';
import config from '../../../config';

export const downloadLimiter = rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit each user to 5 downloads/minute
    keyGenerator: (req) => (req.user_id ? req.user_id : req.ip),
    handler: (req, res) => {
        debugLogger.info(`5 downloads/1m rate limit enforced on user ${req.user_id}`);
        res.status(429).send({ message: 'You can only download 5 files per minute. Wait and try again.' });
    },
    skip: req => req.method === 'OPTIONS',
});

const getDownload = {
    GET: async (req, res) => {
        if (req.query.path.includes('..') || req.query.path.startsWith('/')) {
            return res.status(400).json({ message: 'Path not allowed' });
        }

        try {
            await fs.promises.access(`${config.UPLOAD_DIR}/${req.query.path}`, fs.constants.F_OK);
        } catch (err) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.status(200).download(`${config.UPLOAD_DIR}/${req.query.path}`);
    },
    'x-express-openapi-additional-middleware': [downloadLimiter],
};

getDownload.GET.apiDoc = {
    summary: 'Downloads a file',
    operationId: 'getDownload',
    parameters: [
        {
            in: 'query',
            name: 'path',
            description: 'Which file to download',
            required: true,
            schema: { type: 'string' },
        },
    ],
    responses: {
        200: {
            description: 'File',
            content: { '*/*': { schema: { $ref: '#/components/schemas/File' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default getDownload;
