import SQL from 'sql-template-strings';
import { startOfYear } from '@speechanddebate/nsda-js-utils';
import { query } from '../../helpers/mysql';

const getFiles = {
    GET: async (req, res) => {
        const year = req.query.year || startOfYear;
        const caselists = await query(SQL`
            SELECT * FROM openev WHERE year = ${year}
        `);

        return res.status(200).json(caselists);
    },
};

getFiles.GET.apiDoc = {
    summary: 'Returns files for an open evidence year',
    operationId: 'getFiles',
    parameters: [
        {
            in: 'query',
            name: 'year',
            description: 'What year to return files in',
            required: false,
            schema: { type: 'integer' },
        },
    ],
    responses: {
        200: {
            description: 'Files',
            content: {
                '*/*': {
                    schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/File' },
                    },
                },
            },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
};

export default getFiles;
