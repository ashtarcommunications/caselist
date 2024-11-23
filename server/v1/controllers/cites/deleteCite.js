import SQL from 'sql-template-strings';
import { fetch } from '@speechanddebate/nsda-js-utils';
import { query } from '../../helpers/mysql.js';
import log from '../log/insertEventLog.js';
import config from '../../../config.js';
import { solrLogger } from '../../helpers/logger.js';

const deleteCite = {
    DELETE: async (req, res) => {
        const [cite] = await query(SQL`
            SELECT C.archived
            FROM cites CT
            INNER JOIN rounds R ON R.round_id = CT.round_id
            INNER JOIN teams T on T.team_id = R.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            WHERE C.name = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            AND LOWER(T.name) = LOWER(${req.params.team})
            AND CT.cite_id = ${parseInt(req.params.cite)}
        `);

        // Return a 400 so the UI displays a toast instead of a 404
        if (!cite) { return res.status(400).json({ message: 'Cite not found' }); }
        if (cite.archived) { return res.status(403).json({ message: 'Caselist archived, no modifications allowed' }); }

        await query(SQL`
            INSERT INTO cites_history (
                cite_id,
                version,
                round_id,
                title,
                cites,
                created_at,
                created_by_id,
                updated_at,
                updated_by_id,
                event
            )
            SELECT
                CT.cite_id,
                (SELECT COALESCE(MAX(version), 0) + 1 FROM cites_history CH WHERE CH.cite_id = CT.cite_id) AS 'version',
                CT.round_id,
                CT.title,
                CT.cites,
                CT.created_at,
                CT.created_by_id,
                CURRENT_TIMESTAMP,
                ${req.user_id},
                'delete'
            FROM cites CT
            WHERE CT.cite_id = ${parseInt(req.params.cite)}
        `);

        await query(SQL`
            DELETE FROM cites WHERE cite_id = ${parseInt(req.params.cite)}
        `);

        await log({
            user_id: req.user_id,
            tag: 'cite-delete',
            description: `Deleted cite #${req.params.cite} for ${req.params.school} ${req.params.team} in ${req.params.caselist}`,
            cite_id: parseInt(req.params.cite),
        });

        res.status(200).json({ message: 'Cite successfully deleted' });

        // Delete cite from Solr - wait till after reponse to not slow down UI
        try {
            await fetch(
                config.SOLR_UPDATE_URL,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ delete: { query: `cite_id:${req.params.cite}` } }),
                }
            );
            solrLogger.info(`Removed cite ${req.params.cite} from Solr`);
        } catch (err) {
            solrLogger.info(`Failed to remove cite ${req.params.cite} from Solr: ${err.message}`);
        }

        return true;
    },
};

deleteCite.DELETE.apiDoc = {
    summary: 'Deletes a cite',
    operationId: 'deleteCite',
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
        {
            in: 'path',
            name: 'cite',
            description: 'Cite',
            required: true,
            schema: { type: 'integer' },
        },
    ],
    responses: {
        200: {
            description: 'Deleted cite',
            content: { '*/*': { schema: { $ref: '#/components/schemas/Cite' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default deleteCite;
