import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql.js';

const getRecent = {
	GET: async (req, res) => {
		const sql = SQL`
            SELECT
                R.round_id,
                R.team_id,
                R.side,
                R.tournament,
                R.round,
                R.opponent,
                R.opensource,
                T.name AS 'team_name',
                T.display_name AS 'team_display_name',
                S.name AS 'school_name',
                S.display_name AS 'school_display_name',
                R.updated_at
            FROM rounds R
            INNER JOIN teams T ON T.team_id = R.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON C.caselist_id = S.caselist_id
            wHERE C.name = ${req.params.caselist}
                AND C.archived = 0
            ORDER BY R.updated_at DESC
            LIMIT 50
        `;
		const recent = await query(sql);

		return res.status(200).json(recent);
	},
};

getRecent.GET.apiDoc = {
	summary: 'Returns recent modifications in a caselist',
	operationId: 'getRecent',
	parameters: [
		{
			in: 'path',
			name: 'caselist',
			description: 'Which caselist to get modifications for',
			required: true,
			schema: { type: 'string' },
		},
	],
	responses: {
		200: {
			description: 'Recent rounds',
			content: { '*/*': { schema: { $ref: '#/components/schemas/Recent' } } },
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	security: [{ cookie: [] }],
};

export default getRecent;
