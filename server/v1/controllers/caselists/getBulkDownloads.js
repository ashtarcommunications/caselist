import fs from 'fs';
import config from '../../../config';

const getBulkDownloads = {
    GET: async (req, res) => {
        const files = [];
        try {
            const filelist = await fs.promises.readdir(`${config.UPLOAD_DIR}/weekly/${req.params.caselist}`, { withFileTypes: true });

            filelist.filter(f => !f.isDirectory())
            .filter(f => f.name.slice(-4) === '.zip')
            .forEach(f => {
                files.push({
                    name: f.name,
                    path: `weekly/${req.params.caselist}/${f.name}`,
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
