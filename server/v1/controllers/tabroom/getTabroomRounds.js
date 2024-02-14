import { fetch } from '@speechanddebate/nsda-js-utils';
import config from '../../../config';
import { debugLogger } from '../../helpers/logger';

const getTabroomRounds = {
    GET: async (req, res) => {
        let url = `${config.TABROOM_API_URL}`;

        const base64 = Buffer.from(`${config.TABROOM_API_USER_ID}:${config.TABROOM_API_KEY}`).toString('base64');

        // If no slug, default to the current user's rounds, since you're always allowed to look up your own
        if (req.query.slug) {
            url += `/caselist/rounds?slug=${req.query.slug}`;
        } else {
            url += `/caselist/rounds?person_id=${req.user_id}`;
        }

        if (req.query.current) {
            url += `&current=true`;
        }

        let rounds = [];
        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Basic ${base64}`,
                },
            });
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
        {
            in: 'query',
            name: 'current',
            description: 'Whether to return current rounds',
            required: false,
            schema: {
                type: 'boolean',
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
