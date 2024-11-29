import SQL from 'sql-template-strings';
import { query } from '../../helpers/mysql.js';
import log from '../log/insertEventLog.js';

const postTeam = {
	POST: async (req, res) => {
		const [school] = await query(SQL`
            SELECT C.archived, C.team_size, C.event, S.*
            FROM caselists C
            INNER JOIN schools S ON S.caselist_id = C.caselist_id
            WHERE C.name = ${req.params.caselist}
            AND LOWER(S.name) = LOWER(${req.params.school})
        `);

		if (!school) {
			return res.status(400).json({ message: 'School not found' });
		}
		if (school.archived) {
			return res
				.status(403)
				.json({ message: 'Caselist archived, no modifications allowed' });
		}

		let name = '';
		let displayName = `${school.display_name} `;
		for (let i = 0; i < 4; i++) {
			const debaterFirst = `debater${i + 1}_first`;
			const debaterLast = `debater${i + 1}_last`;
			if (req.body?.[debaterLast]) {
				// For LD, use first two letters of first and last instead of just last name
				if (school.event === 'ld') {
					name += `${req.body?.[debaterFirst]?.slice(0, 2)}${req.body?.[debaterLast]?.slice(0, 2)}`;
					displayName += `${req.body?.[debaterFirst]?.slice(0, 2)}${req.body?.[debaterLast]?.slice(0, 2)}`;
				} else {
					name += `${req.body?.[debaterLast]?.slice(0, 2)}`;
					displayName += `${req.body?.[debaterLast]?.slice(0, 2)}`;
				}
			}
		}
		if (
			req.body.debater1_first?.trim() === 'All' &&
			req.body.debater1_last?.trim() === 'Teams'
		) {
			name = 'All';
			displayName = `${school.display_name} All Teams`;
		}
		if (
			req.body.debater1_first?.trim() === 'All' &&
			req.body.debater1_last?.trim() === 'Novices'
		) {
			name = 'Novices';
			displayName = `${school.display_name} Novices`;
		}

		const like = `${name}%`;
		const team = await query(SQL`
                SELECT T.*
                FROM teams T
                INNER JOIN schools S ON S.school_id = T.school_id
                INNER JOIN caselists C ON S.caselist_id = C.caselist_id
                WHERE C.name = ${req.params.caselist}
                    AND LOWER(S.name) = LOWER(${req.params.school})
                    AND LOWER(T.name) LIKE ${like}
                ORDER BY T.name
        `);

		// If there's an existing team with that name, add a number to the name
		if (team && team.length > 0) {
			let i = 1;
			const lastChar = team[team.length - 1]?.name?.slice(-1);
			const highestNumber = parseInt(lastChar);
			if (highestNumber) {
				i = highestNumber + 1;
			}
			name += i;
			displayName += i;
		}

		const newTeam = await query(SQL`
            INSERT INTO teams
                (
                    school_id,
                    name,
                    display_name,
                    debater1_first,
                    debater1_last,
                    debater1_student_id,
                    debater2_first,
                    debater2_last,
                    debater2_student_id,
                    debater3_first,
                    debater3_last,
                    debater3_student_id,
                    debater4_first,
                    debater4_last,
                    debater4_student_id,
                    created_by_id,
                    updated_by_id
                )
                SELECT
                    S.school_id,
                    ${name},
                    ${displayName},
                    ${req.body.debater1_first?.trim() || null},
                    ${req.body.debater1_last?.trim() || null},
                    ${req.body.debater1_student_id || null},
                    ${req.body.debater2_first?.trim() || null},
                    ${req.body.debater2_last?.trim() || null},
                    ${req.body.debater2_student_id || null},
                    ${req.body.debater3_first?.trim() || null},
                    ${req.body.debater3_last?.trim() || null},
                    ${req.body.debater3_student_id || null},
                    ${req.body.debater4_first?.trim() || null},
                    ${req.body.debater4_last?.trim() || null},
                    ${req.body.debater4_student_id || null},
                    ${req.user_id},
                    ${req.user_id}
                FROM schools S
                INNER JOIN caselists C ON S.caselist_id = C.caselist_id
                WHERE C.name = ${req.params.caselist}
                AND LOWER(S.name) = LOWER(${req.params.school})
        `);

		await query(SQL`
            INSERT INTO teams_history (
                team_id,
                version,
                school_id,
                name,
                display_name,
                notes,
                debater1_first,
                debater1_last,
                debater1_student_id,
                debater2_first,
                debater2_last,
                debater2_student_id,
                debater3_first,
                debater3_last,
                debater3_student_id,
                debater4_first,
                debater4_last,
                debater4_student_id,
                created_at,
                created_by_id,
                updated_at,
                updated_by_id,
                event
            )
            SELECT
                T.team_id,
                (SELECT COALESCE(MAX(version), 0) + 1 FROM teams_history TH WHERE TH.team_id = T.team_id) AS 'version',
                T.school_id,
                T.name,
                T.display_name,
                T.notes,
                T.debater1_first,
                T.debater1_last,
                T.debater1_student_id,
                T.debater2_first,
                T.debater2_last,
                T.debater2_student_id,
                T.debater3_first,
                T.debater3_last,
                T.debater3_student_id,
                T.debater4_first,
                T.debater4_last,
                T.debater4_student_id,
                T.created_at,
                T.created_by_id,
                T.updated_at,
                T.updated_by_id,
                'insert'
            FROM teams T
            WHERE T.team_id = ${parseInt(newTeam.insertId)}
        `);

		await log({
			user_id: req.user_id,
			tag: 'team-add',
			description: `Added team #${newTeam.insertId} to ${req.params.school} in ${req.params.caselist}`,
			team_id: parseInt(newTeam.insertId),
		});

		return res.status(201).json({ message: 'Team successfully created' });
	},
};

postTeam.POST.apiDoc = {
	summary: 'Creates a team',
	operationId: 'postTeam',
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
	],
	requestBody: {
		description: 'The team to create',
		required: true,
		content: { '*/*': { schema: { $ref: '#/components/schemas/Team' } } },
	},
	responses: {
		201: {
			description: 'Created team',
			content: { '*/*': { schema: { $ref: '#/components/schemas/Team' } } },
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	security: [{ cookie: [] }],
};

export default postTeam;
