import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql.js';

const getTeams = {
	GET: async (req, res) => {
		const sql = SQL`
            SELECT
                C.archived,
                T.*
            FROM teams T
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON S.caselist_id = C.caselist_id
            wHERE C.name = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            ORDER BY T.name
        `;
		const teams = await query(sql);

		if (teams.length > 0 && teams[0].archived) {
			teams.forEach((team) => {
				team.debater1_first = team.debater1_first
					? `${team.debater1_first.substr(0, 2)}.....`
					: null;
				team.debater1_last = team.debater1_last
					? `${team.debater1_last.substr(0, 2)}.....`
					: null;
				team.debater2_first = team.debater2_first
					? `${team.debater2_first.substr(0, 2)}.....`
					: null;
				team.debater2_last = team.debater2_last
					? `${team.debater2_last.substr(0, 2)}.....`
					: null;
				team.debater3_first = team.debater3_first
					? `${team.debater3_first.substr(0, 2)}.....`
					: null;
				team.debater3_last = team.debater3_last
					? `${team.debater3_last.substr(0, 2)}.....`
					: null;
				team.debater4_first = team.debater4_first
					? `${team.debater4_first.substr(0, 2)}.....`
					: null;
				team.debater4_last = team.debater4_last
					? `${team.debater4_last.substr(0, 2)}.....`
					: null;

				delete team.updated_by;
				delete team.notes;
			});
		}

		return res.status(200).json(teams);
	},
};

getTeams.GET.apiDoc = {
	summary: 'Returns list of teams in a school',
	operationId: 'getTeams',
	parameters: [
		{
			in: 'path',
			name: 'caselist',
			description: 'Which caselist to return schools in',
			required: true,
			schema: { type: 'string' },
		},
		{
			in: 'path',
			name: 'school',
			description: 'Which school to return teams in',
			required: true,
			schema: { type: 'string' },
		},
	],
	responses: {
		200: {
			description: 'Teams',
			content: {
				'*/*': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/Team' },
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	security: [{ cookie: [] }],
};

export default getTeams;
