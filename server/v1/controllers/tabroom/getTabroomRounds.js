import crypto from 'crypto';
import { fetch } from '@speechanddebate/nsda-js-utils';
import config from '../../../config';
import { debugLogger } from '../../helpers/logger';

const getTabroomRounds = {
    GET: async (req, res) => {
        const hash = crypto.createHash('sha256').update(config.TABROOM_CASELIST_KEY).digest('hex');
        let url = `${config.TABROOM_API_URL}`;

        // If no slug, default to the current user's rounds, since you're always allowed to look up your own
        if (req.params.slug) {
            url += `/caselist/rounds?slug=${req.params.slug}`;
        } else {
            url += `/caselist/rounds?person_id=${req.user_id}`;
        }
        url += `&caselist_key=${hash}`;

        let rounds = [];
        try {
            const response = await fetch(url);
            rounds = await response.json();
            if (!Array.isArray(rounds)) { rounds = []; }
        } catch (err) {
            debugLogger.error('Failed to retrieve Tabroom rounds');
            rounds = [];
        }

        return res.status(200).json(rounds);
    },
};

getTabroomRounds.GET.apiDoc = {
    summary: 'Returns list of rounds linked to a user or slug on Tabroom',
    operationId: 'getTabroomRounds',
    parameters: [
        {
            in: 'query',
            name: 'slug',
            description: 'Slug of page to match rounds',
            required: false,
            schema: {
                type: 'string',
            },
        },
    ],
    responses: {
        200: {
            description: 'Rounds',
            content: {
                '*/*': {
                    schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/TabroomRound' },
                    },
                },
            },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default getTabroomRounds;
