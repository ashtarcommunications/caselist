import { fetch } from '@speechanddebate/nsda-js-utils';
import config from '../../../config.js';
import { debugLogger } from '../../helpers/logger.js';

const getTabroomChapters = {
	GET: async (req, res) => {
		let url = `${config.TABROOM_API_URL}`;
		url += `/ext/caselist/chapters?person_id=${req.user_id}`;

		const base64 = Buffer.from(
			`${config.TABROOM_API_USER_ID}:${config.TABROOM_API_KEY}`,
		).toString('base64');

		let chapters = [];
		try {
			const response = await fetch(url, {
				headers: {
					Authorization: `Basic ${base64}`,
				},
			});
			chapters = await response.json();
			if (!Array.isArray(chapters)) {
				chapters = [];
			}
		} catch (err) {
			debugLogger.error(`Failed to retrieve Tabroom chapters: ${err}`);
			chapters = [];
		}

		return res.status(200).json(chapters);
	},
};

getTabroomChapters.GET.apiDoc = {
	summary: 'Returns list of chapters linked to a user on Tabroom',
	operationId: 'getTabroomChapters',
	responses: {
		200: {
			description: 'Chapters',
			content: {
				'*/*': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/TabroomChapter' },
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	security: [{ cookie: [] }],
};

export default getTabroomChapters;
