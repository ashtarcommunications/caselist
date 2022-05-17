import fetch from 'isomorphic-fetch';
import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql';
import config from '../../../config';

const getSearch = {
    GET: async (req, res) => {
        const q = req.query.q.trim();
        const caselist = req.params.caselist;
        const like = `%${q}%`;

        const schoolSQL = (SQL`
            SELECT
                'school' AS 'type',
                S.name,
                S.display_name,
                C.name
            FROM schools S
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
        `);
        schoolSQL.append(SQL`
            WHERE S.display_name LIKE ${like}
        `);
        if (caselist) {
            schoolSQL.append(SQL`
                AND LOWER(C.name) = LOWER(${caselist})
            `);
        }
        const schools = await query(schoolSQL);

        const teamSQL = (SQL`
            SELECT
                'team' AS 'type',
                T.name,
                T.display_name,
                S.name AS 'school',
                C.name AS 'caselist'
            FROM teams T
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
        `);
        teamSQL.append(SQL`
            WHERE T.display_name LIKE ${like}
        `);
        if (caselist) {
            teamSQL.append(SQL`
                AND LOWER(C.name) = LOWER(${caselist})
            `);
        }
        const teams = await query(teamSQL);

        const citeSQL = (SQL`
            SELECT
                'cite' AS 'type',
                CT.title,
                CT.cites,
                T.name AS 'team',
                S.name AS 'school',
                C.name AS 'caselist'
            FROM cites CT
            INNER JOIN rounds R ON R.round_id = CT.round_id
            INNER JOIN teams T ON T.team_id = R.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
        `);
        citeSQL.append(SQL`
            WHERE CT.cites LIKE ${like}
        `);
        if (caselist) {
            citeSQL.append(SQL`
                AND LOWER(C.name) = LOWER(${caselist})
            `);
        }
        const cites = await query(citeSQL);

        let solr = [];
        try {
            let URL = config.SOLR_QUERY_URL;
            URL += `df=content`; // Search field
            URL += `&fl=id`; // Fields to return
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
            URL += `&hl.maxAnalyzedChars=500000`; // Increase the number of analyzed characters for long files
            URL += `&hl.defaultSummary=true`; // Return leading text if it can't highlight

            URL += `&q=${encodeURIComponent(q)}`; // Search query
            const response = await fetch(URL, { headers: { Accept: 'application/json' } });
            const json = await response.json();

            solr = json?.response?.docs?.map(d => {
                return {
                    // Strip the upload path from the id to get the download path
                    type: 'opensource',
                    path: d.id.replace(`${config.UPLOAD_DIR}/`, ''),
                    snippet: json?.highlighting?.[d.id]?.content?.[0],
                };
            });
        } catch (err) {
            console.log(err);
        }

        const combinedResults = [...schools, ...teams, ...cites, ...solr];

        return res.status(200).json(combinedResults);
    },
};

getSearch.GET.apiDoc = {
    summary: 'Returns search results',
    operationId: 'getSearch',
    parameters: [
        {
            in: 'query',
            name: 'caselist',
            description: 'Caselist to search in',
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
