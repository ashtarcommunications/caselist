import crypto from 'crypto';
import log from '../log/insertEventLog';
import config from '../../../config';
import { debugLogger } from '../../helpers/logger';

const postTabroomLink = {
    POST: async (req, res) => {
        const url = `${config.TABROOM_API_URL}/caselist/link`;
        const hash = crypto.createHash('sha256').update(config.TABROOM_CASELIST_KEY).digest('hex');

        const body = {
            person_id: req.user_id,
            slug: req.body.slug,
            caselist_key: hash,
        };

        try {
            await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
        } catch (err) {
            debugLogger.error(`Failed to create Tabroom link to ${req.body.slug}`);
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
