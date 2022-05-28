import SQL from 'sql-template-strings';
import fs from 'fs';
import path from 'path';
import { fetch } from '@speechanddebate/nsda-js-utils';

import config from '../../../config';
import { query } from '../../helpers/mysql';
import log from '../log/insertEventLog';
import { debugLogger } from '../../helpers/logger';

const deleteRound = {
    DELETE: async (req, res) => {
        const [round] = await query(SQL`
            SELECT
                C.archived,
                R.opensource,
                (SELECT COALESCE(MAX(version), 0) + 1 FROM rounds_history RH WHERE RH.round_id = R.round_id) AS 'version'
            FROM rounds R
            INNER JOIN teams T on T.team_id = R.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            WHERE C.name = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            AND LOWER(T.name) = LOWER(${req.params.team})
            AND R.round_id = ${req.params.round}
        `);

        if (!round) { return res.status(400).json({ message: 'Round not found' }); }
        if (round.archived) { return res.status(403).json({ message: 'Caselist archived, no modifications allowed' }); }

        if (round.opensource) {
            const extension = path.extname(round.opensource);
            const deletedExtension = `-DELETED-v${round.version}${extension}`;
            const deletedPath = `${config.UPLOAD_DIR}/${round.opensource.replace(extension, deletedExtension)}`;
            try {
                await fs.promises.rename(`${config.UPLOAD_DIR}/${round.opensource}`, deletedPath);
            } catch (err) {
                debugLogger.info(`Failed to rename ${round.opensource}`);
            }
        }
        const body = JSON.stringify({ delete: { id: round.opensource } });
        try {
            await fetch(
                'http://localhost:8983/solr/caselist/update?commit=true',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body,
                }
            );
        } catch (err) {
            debugLogger.info(`Failed to remove ${round.opensource} from Solr`);
        }

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
            WHERE CT.round_id = ${parseInt(req.params.round)}
        `);

        await query(SQL`
            DELETE FROM cites WHERE round_id = ${parseInt(req.params.round)}
        `);

        await query(SQL`
            INSERT INTO rounds_history (
                round_id,
                version,
                team_id,
                side,
                tournament,
                round,
                opponent,
                judge,
                report,
                opensource,
                video,
                tourn_id,
                external_id,
                created_at,
                created_by_id,
                updated_at,
                updated_by_id,
                event
            )
            SELECT
                R.round_id,
                (SELECT COALESCE(MAX(version), 0) + 1 FROM rounds_history RH WHERE RH.round_id = R.round_id) AS 'version',
                R.team_id,
                R.side,
                R.tournament,
                R.round,
                R.opponent,
                R.judge,
                R.report,
                R.opensource,
                R.video,
                R.tourn_id,
                R.external_id,
                R.created_at,
                R.created_by_id,
                CURRENT_TIMESTAMP,
                ${req.user_id},
                'delete'
            FROM rounds R
            WHERE R.round_id = ${parseInt(req.params.round)}
        `);

        await query(SQL`
            DELETE FROM rounds WHERE round_id = ${parseInt(req.params.round)}
        `);

        await log({
            user_id: req.user_id,
            tag: 'round-delete',
            description: `Deleted round #${req.params.round} for ${req.params.school} ${req.params.team} in ${req.params.caselist}`,
            round_id: parseInt(req.params.round),
        });

        return res.status(200).json({ message: 'Round successfully deleted' });
    },
};

deleteRound.DELETE.apiDoc = {
    summary: 'Deletes a round',
    operationId: 'deleteRound',
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
            name: 'round',
            description: 'Round',
            required: true,
            schema: { type: 'integer' },
        },
    ],
    responses: {
        200: {
            description: 'Deleted round',
            content: { '*/*': { schema: { $ref: '#/components/schemas/Round' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
    security: [{ cookie: [] }],
};

export default deleteRound;
