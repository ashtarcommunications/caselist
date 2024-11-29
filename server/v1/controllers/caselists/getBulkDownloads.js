import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import config from '../../../config.js';

const getBulkDownloads = {
	GET: async (req, res) => {
		const files = [];

		const client = new S3Client({
			endpoint: `https://${config.S3_ENDPOINT}`,
			region: config.S3_REGION,
		});

		const command = new ListObjectsV2Command({
			Bucket: config.S3_BUCKET,
			Prefix: `weekly/${req.params.caselist}`,
		});

		try {
			const data = await client.send(command);

			const filelist = data.Contents.filter(
				(f) => f.Key !== `weekly/${req.params.caselist}`,
			)
				.filter((f) => f.Key.slice(-4) === '.zip')
				.map((f) => f.Key?.split('/')?.pop());

			filelist.forEach((f) => {
				files.push({
					name: f,
					url: `https://${config.S3_BUCKET}.${config.S3_ENDPOINT}/weekly/${req.params.caselist}/${f}`,
				});
			});
		} catch (err) {
			return res.status(500).json('Failed to retrieve bulk downloads');
		}

		return res.status(200).json(files);
	},
};

getBulkDownloads.GET.apiDoc = {
	summary: 'Returns bulk downloads in a caselist',
	operationId: 'getBulkDownloads',
	parameters: [
		{
			in: 'path',
			name: 'caselist',
			description: 'Which caselist to get bulk downloads for',
			required: true,
			schema: { type: 'string' },
		},
	],
	responses: {
		200: {
			description: 'Bulk downloads',
			content: {
				'*/*': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/Download' },
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	security: [{ cookie: [] }],
};

export default getBulkDownloads;
