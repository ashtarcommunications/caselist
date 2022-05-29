import { fetch } from '@speechanddebate/nsda-js-utils';
import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';
import config from '../../../config';
import { debugLogger } from '../../helpers/logger';

const getSearch = {
    GET: async (req, res) => {
        const q = req.query.q?.trim();
        const shard = req.query.shard?.trim();
        const like = `%${q}%`;

        const teamSQL = (SQL`
            SELECT
                'team' AS 'type',
                T.team_id,
                T.name AS 'team',
                T.display_name AS 'team_display_name',
                S.name AS 'school',
                C.name AS 'caselist',
                C.display_name AS 'caselist_display_name',
                CONCAT(C.name, '/', S.name, '/', T.name) AS 'path'
            FROM teams T
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
        `);
        teamSQL.append(SQL`
            WHERE T.display_name LIKE ${like}
        `);
        if (shard) {
            teamSQL.append(SQL`
                AND LOWER(C.name) = LOWER(${shard})
            `);
        }
        const teams = await query(teamSQL);

        let solr = [];
        try {
            let URL = config.SOLR_QUERY_URL;
            URL += `df=content,title,path`; // Search fields
            if (shard) {
                URL += `&fq=shard:${shard}`; // Shard to search in
            }
            URL += `&fl=id,shard,type,caselist,caselist_display_name,school,team,team_display_name,year,path`; // Fields to return
            URL += `&indent=false`; // Don't format JSON to save whitespace
            URL += `&q.op=OR`; // Search operator
            URL += `&rows=100&start=0`; // Rows to return
            URL += `&hl=true`; // Enable highlighted snippets
            URL += `&hl.fl=content`; // Highlight from the content field
            URL += `&hl.method=unified`; // Use the unified highlighter
            URL += `&hl.usePhraseHighlighter=true`; // Use the phrase highlighter
            URL += `&hl.highlightMultiTerm=true`; // Allow multi-phrase highlighting
            URL += `&hl.snippets=3`; // Return multiple snippets
            URL += `&hl.mergeContiguous=true`; // Merge multiple snippets into one
            URL += `&hl.maxAnalyzedChars=1000000`; // Increase the number of analyzed characters for long files
            URL += `&hl.defaultSummary=true`; // Return leading text if it can't highlight
            URL += `&q=${encodeURIComponent(q)}`; // Search query

            const response = await fetch(URL, { headers: { Accept: 'application/json' } });
            const json = await response.json();

            solr = json?.response?.docs?.map(d => {
                return {
                    type: d.type?.[0],
                    shard: d.shard?.[0],
                    caselist: d.caselist?.[0],
                    caselist_display_name: d.caselist_display_name?.[0],
                    school: d.school?.[0],
                    team: d.team?.[0],
                    team_display_name: d.team_display_name?.[0],
                    year: d.year?.[0],
                    path: d.path?.[0],
                    download_path: d.download_path?.[0],
                    title: d.title?.[0] || d.path?.[0]?.split('/')?.pop(),
                    snippet: json?.highlighting?.[d.id]?.content?.[0],
                };
            });
        } catch (err) {
            debugLogger.info(err.message);
            solr = [];
        }

        const combinedResults = [...teams, ...solr];

        return res.status(200).json(combinedResults);
    },
};

getSearch.GET.apiDoc = {
    summary: 'Returns search results',
    operationId: 'getSearch',
    parameters: [
        {
            in: 'query',
            name: 'shard',
            description: 'Shard to search in',
            schema: { type: 'string' },
        },
        {
            in: 'query',
            name: 'q',
            description: 'Search query',
            required: true,
            schema: { type: 'string' },
        },
    ],
    responses: {
        200: {
            description: 'Search result',
            content: { '*/*': { schema: { $ref: '#/components/schemas/SearchResult' } } },
        },
        default: { $ref: '#/components/responses/ErrorResponse' },
    },
};

export default getSearch;
