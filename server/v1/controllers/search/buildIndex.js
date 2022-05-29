/* eslint-disable no-restricted-syntax, no-await-in-loop, no-continue */
import fs from 'fs';
import { fetch } from '@speechanddebate/nsda-js-utils';

import SQL from 'sql-template-strings';
import { pool, query } from '../../helpers/mysql';
import config from '../../../config';
import { solrLogger } from '../../helpers/logger';

export const buildIndex = async () => {
    solrLogger.info('Starting reindex of Solr...');

    const opensource = await query(SQL`
        SELECT
            DISTINCT R.opensource AS 'download_path',
            CONCAT(C.name, '/', S.name, '/', T.name) AS 'path',
            C.name AS 'shard',
            C.name AS 'caselist',
            C.display_name AS 'caselist_display_name',
            S.name AS 'school',
            T.name AS 'team',
            T.display_name AS 'team_display_name'
        FROM rounds R
        INNER JOIN teams T ON T.team_id = R.team_id
        INNER JOIN schools S ON S.school_id = T.school_id
        INNER JOIN caselists C ON C.caselist_id = S.caselist_id
        WHERE R.opensource IS NOT NULL
    `);

    solrLogger.info(`Found ${opensource.length} open source files...`);

    const openev = await query(SQL`
        SELECT
            DISTINCT O.path AS 'download_path',
            CONCAT('openev', '/', O.year) AS 'path',
            O.year AS 'year',
            CONCAT('openev-', O.year) AS 'shard'
        FROM openev O
        WHERE O.path IS NOT NULL
    `);

    solrLogger.info(`Found ${openev.length} OpenEv files...`);

    const files = [...opensource, ...openev];

    for (const file of files) {
        solrLogger.info(`Loading contents of ${file.path}...`);
        let contents;
        try {
            contents = fs.readFileSync(`${config.UPLOAD_DIR}/${file.path}`);
        } catch (err) {
            solrLogger.error(`Failed to load ${file.path}: ${err.message}`);
            continue;
        }

        // Extract the file metadata with Tika
        solrLogger.info(`Extracting metadata for ${file.path}...`);
        let meta;
        try {
            const response = await fetch(
                'http://localhost:9998/meta',
                {
                    method: 'PUT',
                    headers: {
                        Accept: 'application/json',
                    },
                    body: contents,
                }
            );
            meta = await response.json();

            // Add additional metadata to allow targeting searches and linking to results
            meta.type = 'file';
            meta.shard = file.shard;
            meta.caselist = file.caselist;
            meta.caselist_display_name = file.caselist_display_name;
            meta.school = file.school;
            meta.team = file.team;
            meta.team_display_name = file.team_display_name;
            meta.year = file.year;
            meta.path = file.path;
        } catch (err) {
            solrLogger.error(`Failed to extract metadata for ${file.path}: ${err.message}`);
            continue;
        }

        // Extract the text content of the file with Tika
        solrLogger.info(`Extracting text content for ${file.path}...`);
        let textContents;
        try {
            const text = await fetch(
                'http://localhost:9998/tika',
                {
                    method: 'PUT',
                    headers: {
                        Accept: 'text/plain',
                    },
                    body: contents,
                }
            );
            textContents = await text.text();
        } catch (err) {
            solrLogger.error(`Failed to extract text content for ${file.path}: ${err.message}`);
            continue;
        }

        // Assemble the data for ingestion into Solr
        const body = JSON.stringify([{ ...meta, id: file.path, content: textContents }]);

        // Ingest into Solr
        solrLogger.info(`Ingesting ${file.path} into Solr...`);
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
            solrLogger.info(`Successfully ingested ${file.path} into Solr...`);
        } catch (err) {
            solrLogger.error(`Failed to ingest ${file.path} into Solr: ${err.message}`);
            continue;
        }
    }

    solrLogger.info(`Ingesting cites into Solr...`);
    const cites = await query(SQL`
        SELECT
            'cite' AS 'type',
            CT.cite_id,
            CT.title,
            CT.cites,
            T.name AS 'team',
            T.display_name AS 'team_display_name',
            S.name AS 'school',
            C.name AS 'caselist',
            C.display_name AS 'caselist_display_name',
            CONCAT(C.name, '/', S.name, '/', T.name, '#', CT.cite_id) AS 'path'
        FROM cites CT
        INNER JOIN rounds R ON R.round_id = CT.round_id
        INNER JOIN teams T ON T.team_id = R.team_id
        INNER JOIN schools S ON S.school_id = T.school_id
        INNER JOIN caselists C ON C.caselist_id = S.caselist_id
    `);

    solrLogger.info(`Found ${cites.length} cites...`);

    for (const cite of cites) {
        // Assemble the data for ingestion into Solr
        const body = JSON.stringify([{ ...cite, id: `${cite.path}#${cite.cite_id}`, content: cite.cites }]);

        // Ingest cite into Solr
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
            solrLogger.error(`Failed to ingest cite ${cite.cite_id} into Solr: ${err.message}`);
            continue;
        }
    }

    solrLogger.info('Finished reindex of Solr.');
    pool.end();
};

export default buildIndex;
