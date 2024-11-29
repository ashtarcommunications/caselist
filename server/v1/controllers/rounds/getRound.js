import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql.js';

const getRound = {
	GET: async (req, res) => {
		const [round] = await query(SQL`
            SELECT R.* FROM rounds R
            INNER JOIN teams T ON T.team_id = R.team_id
            INNER JOIN schools S ON S.school_id = T.school_id
            INNER JOIN caselists C ON S.caselist_id = C.caselist_id
            WHERE C.name = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
            AND LOWER(T.name) = LOWER(${req.params.team})
            AND R.round_id = ${req.params.round}
        `);
		if (!round) {
			return res.status(404).json({ message: 'Round not found' });
		}

		return res.status(200).json(round);
	},
};

getRound.GET.apiDoc = {
	summary: 'Returns a single round',
	operationId: 'getRound',
	parameters: [
		{
			in: 'path',
			name: 'caselist',
			description: 'Which caselist to return round in',
			required: true,
			schema: { type: 'string' },
		},
		{
			in: 'path',
			name: 'school',
			description: 'Which school round belongs to',
			required: true,
			schema: { type: 'string' },
		},
		{
			in: 'path',
			name: 'team',
			description: 'Which team to return round for',
			required: true,
			schema: { type: 'string' },
		},
		{
			in: 'path',
			name: 'round',
			description: 'Which round to return',
			required: true,
			schema: { type: 'integer' },
		},
	],
	responses: {
		200: {
			description: 'Round',
			content: { '*/*': { schema: { $ref: '#/components/schemas/Round' } } },
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	security: [{ cookie: [] }],
};

export default getRound;
