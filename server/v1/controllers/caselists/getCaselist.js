import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql.js';

const getCaselist = {
	GET: async (req, res) => {
		const [caselist] = await query(SQL`
            SELECT * FROM caselists C
            wHERE C.name = ${req.params.caselist}
        `);
		if (!caselist) {
			return res.status(404).json({ message: 'Caselist not found' });
		}
		caselist.archived = caselist.archived === 1;

		return res.status(200).json(caselist);
	},
};

getCaselist.GET.apiDoc = {
	summary: 'Returns a school',
	operationId: 'getSchool',
	parameters: [
		{
			in: 'path',
			name: 'caselist',
			description: 'Which caselist to return',
			required: true,
			schema: { type: 'string' },
		},
	],
	responses: {
		200: {
			description: 'Caselist',
			content: { '*/*': { schema: { $ref: '#/components/schemas/Caselist' } } },
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	security: [{ cookie: [] }],
};

export default getCaselist;
