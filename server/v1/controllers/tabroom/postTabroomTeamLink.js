import log from '../log/insertEventLog';
import config from '../../../config';
import { debugLogger } from '../../helpers/logger';

const postTabroomTeamLink = {
    POST: async (req, res) => {
        let url = `${config.TABROOM_API_URL}`;
        url += `/caselist/link?person_id=${req.user_id}`;
        url += `&caselist_key=${config.TABROOM_CASELIST_KEY}`;

        const body = {
            slug: req.body.slug,
        };

        try {
            await fetch(url, { method: 'POST', body });
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

postTabroomTeamLink.POST.apiDoc = {
    summary: 'Creates a tabroom team link',
    operationId: 'postTabroomTeamLink',
    requestBody: {
        description: 'The link to create',
        required: true,
        content: { '*/*': { schema: { $ref: '#/components/schemas/TabroomStudent' } } },
    },
    responses: {
        201: {
            description: 'Created link',
            content: { '*/*': { schema: { $ref: '#/components/schemas/TabroomStudent' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default postTabroomTeamLink;
