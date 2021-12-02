import SQL from 'sql-template-strings';
// import AWS from 'aws-sdk';
// import multer from 'multer';
// import multerS3 from 'multer-s3';
// import config from '../../../config';
import { query } from '../../helpers/mysql';

const postRound = {
    POST: async (req, res) => {
        // const filename = `${req.params.school}-${req.params.team}-${req.body.side}.docx`;
        // const s3 = new AWS.S3();
        // const upload = multer({
        //     storage: multerS3({
        //         s3,
        //         bucket: config.S3_BUCKET,
        //         contentType: multerS3.AUTO_CONTENT_TYPE,
        //         key: (req, file, cb) => {
        //             cb(null, `${req.params.caselist}/${req.params.schools}/${req.params.team}/${filename}`);
        //         },
        //     }),
        // });
        // upload.single(req.body.opensource);

        await query(SQL`
            INSERT INTO rounds (team_id, side, tournament, round, opponent, judge, report, tourn_id, external_id)
                SELECT
                    T.team_id,
                    ${req.body.side},
                    ${req.body.tourn},
                    ${req.body.round},
                    ${req.body.opponent},
                    ${req.body.judge},
                    ${req.body.report},
                    ${req.body.tourn_id},
                    ${req.body.external_id}
                FROM teams T
                INNER JOIN schools S ON S.school_id = T.school_id
                INNER JOIN caselists C ON C.caselist_id = S.caselist_id
                WHERE C.slug = ${req.params.caselist}
                AND LOWER(S.name) = LOWER(${req.params.school})
                AND LOWER(T.code) = LOWER(${req.params.team})
        `);

        return res.status(201).json({ message: 'Round successfully created' });
    },
};

postRound.POST.apiDoc = {
    summary: 'Creates a round',
    operationId: 'postRound',
    parameters: [
        {
            in: 'path',
            name: 'caselist',
            description: 'Caselist',
            required: true,
            schema: { type: 'string' },
        },
        {
            in: 'path',
            name: 'school',
            description: 'School',
            required: true,
            schema: { type: 'string' },
        },
        {
            in: 'path',
            name: 'team',
            description: 'Team',
            required: true,
            schema: { type: 'string' },
        },
    ],
    requestBody: {
        description: 'The round to create',
        required: true,
        content: { '*/*': { schema: { $ref: '#/components/schemas/Round' } } },
    },
    responses: {
        201: {
            description: 'Created round',
            content: { '*/*': { schema: { $ref: '#/components/schemas/Round' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default postRound;
