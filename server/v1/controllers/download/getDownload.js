import fs from 'fs';
import config from '../../../config';

const getDownload = {
    GET: async (req, res) => {
        try {
            await fs.promises.access(`${config.UPLOAD_DIR}/${req.query.path}`, fs.constants.F_OK);
        } catch (err) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.status(200).download(`${config.UPLOAD_DIR}/${req.query.path}`);
    },
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
};

export default getDownload;
