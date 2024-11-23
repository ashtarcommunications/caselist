import { fetch } from '@speechanddebate/nsda-js-utils';
import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql.js';
import log from '../log/insertEventLog.js';
import config from '../../../config.js';
import { debugLogger } from '../../helpers/logger.js';

const postTabroomLink = {
    POST: async (req, res) => {
        const url = `${config.TABROOM_API_URL}/ext/caselist/link`;
        const base64 = Buffer.from(`${config.TABROOM_API_USER_ID}:${config.TABROOM_API_KEY}`).toString('base64');

        const caselist = req.body?.slug?.trim().split('/').filter(x => x !== '')[0];
        const event = await query(SQL`
            SELECT event FROM caselists WHERE name = ${caselist}
        `);
        if (!event || event.length < 1) {
            return res.status(400).json({ message: 'Invalid caselist URL' });
        }

        let eventCode = 0;
        if (event === 'cx') { eventCode = 103; }
        if (event === 'ld') { eventCode = 102; }
        if (event === 'pf') { eventCode = 104; }

        const body = {
            person_id: parseInt(req.user_id),
            slug: req.body.slug,
            eventcode: eventCode,
        };

        try {
            await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${base64}`,
                },
                body: JSON.stringify(body) });
        } catch (err) {
            debugLogger.error(`Failed to create Tabroom link to ${req.body.slug}: ${err}`);
            return res.status(500).json({ message: 'Failed to link to tabroom' });
        }

        await log({
            user_id: req.user_id,
            tag: 'tabroom-add',
            description: `Linked ${req.body.slug} to Tabroom`,
        });

        return res.status(201).json({ message: 'Successfully linked to Tabroom' });
    },
};

postTabroomLink.POST.apiDoc = {
    summary: 'Creates a tabroom link',
    operationId: 'postTabroomLink',
    requestBody: {
        description: 'The link to create',
        required: true,
        content: { '*/*': { schema: { $ref: '#/components/schemas/TabroomLink' } } },
    },
    responses: {
        201: {
            description: 'Created link',
            content: { '*/*': { schema: { $ref: '#/components/schemas/TabroomLink' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default postTabroomLink;
