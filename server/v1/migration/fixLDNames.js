// #!/usr/bin/env node
// Invoke from CLI like:
// node --experimental-specifier-resolution=node v1/migration/fixLDNames.js
/* istanbul ignore file */
/* eslint-disable */

import Bottleneck from 'bottleneck';
import SQL from 'sql-template-strings';
import { query, pool } from '../helpers/mysql.js';

const fixLDNames = async () => {
	const teams = await query(SQL`
        SELECT
            T.team_id,
            T.name AS 'team_name',
            T.display_name AS 'team_display_name',
            T.debater1_first AS 'debater1_first',
            T.debater1_last AS 'debater1_last',
            S.name AS 'school_name',
            S.display_name AS 'school_display_name',
            C.name AS 'caselist_name',
            C.event
        FROM teams T
        INNER JOIN schools S ON S.school_id = T.school_id
        INNER JOIN caselists C ON C.caselist_id = S.caselist_id
        WHERE C.event = 'ld'
        AND T.name <> 'All'
        AND T.name <> 'Novices'
    `);

	const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 10 });

	console.log('Starting fixing LD names...');

	/* eslint-disable no-restricted-syntax */
	for (const t of teams) {
		console.log(
			`Fixing team ${t.team_id} for ${t.caselist_name}/${t.school_name}/${t.team_name}...`,
		);

		/* eslint-disable no-await-in-loop */
		/* eslint-disable no-loop-func */
		await limiter.schedule(async () => {
			let name = '';
			let displayName = `${t.school_display_name} `;

			name += `${t.debater1_first.slice(0, 2)}${t.debater1_last.slice(0, 2)}`;
			displayName += `${t.debater1_first.slice(0, 2)}${t.debater1_last.slice(0, 2)}`;

			const like = `${name}%`;
			const team = await query(SQL`
                    SELECT T.*
                    FROM teams T
                    INNER JOIN schools S ON S.school_id = T.school_id
                    INNER JOIN caselists C ON S.caselist_id = C.caselist_id
                    WHERE C.name = ${t.caselist_name}
                        AND LOWER(S.name) = LOWER(${t.school_name})
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

			console.log(
				`Changing ${t.team_name} to ${name} for ${t.debater1_first} ${t.debater1_last}...`,
			);
			try {
				await query(SQL`
                    UPDATE teams T SET name = ${name}, display_name = ${displayName} WHERE team_id = ${t.team_id}
                `);
			} catch (err) {
				// Do nothing
			}
		});
	}

	console.log('Finished fixing LD names.');
	pool.end();

	return true;
};

fixLDNames();

export default fixLDNames;
