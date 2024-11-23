// #!/usr/bin/env node
// Because I am incredibly stupid
// Invoke from CLI like:
// node --experimental-specifier-resolution=node v1/migration/fixNegOpenSource.js
/* istanbul ignore file */

import Bottleneck from 'bottleneck';
import fs from 'fs';
import { cwd } from 'process';
import SQL from 'sql-template-strings';
import { query, pool } from '../helpers/mysql.js';

const fixNegOpenSource = async () => {
    const negRounds = await query(SQL`
        SELECT
            R.round_id AS 'round_id',
            C.name AS 'caselist',
            S.name AS 'school',
            T.name AS 'team',
            R.tournament AS 'tournament',
            R.round AS 'round'
        FROM rounds R
        INNER JOIN teams T ON T.team_id = R.team_id
        INNER JOIN schools S ON S.school_id = T.school_id
        INNER JOIN caselists C ON C.caselist_id = S.caselist_id
        WHERE side = 'N' and opensource IS NULL
    `);
    console.log(`Found ${negRounds.length} missing Neg rounds`);

    const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 10 });

    console.log('Starting fixing neg open source...');

    /* eslint-disable no-restricted-syntax */
    for (const r of negRounds) {
        console.log(`Fixing round ${r.round_id} for ${r.caselist}/${r.school}/${r.team}...`);

        /* eslint-disable no-await-in-loop */
        /* eslint-disable no-loop-func */
        await limiter.schedule(async () => {
            const path = `${cwd()}/uploads/${r.caselist}/${r.school}/${r.team}`;
            try {
                const files = await fs.promises.readdir(path);
                for (const f of files) {
                    if (
                        f.includes(`-Neg-`)
                        && f.includes(`-${r.tournament.replaceAll(' ', '%20')}-`)
                        && (f.includes(`-Round${r.round}.`) || f.includes(`-${r.round}.`))
                    ) {
                        console.log(`Found match for ${r.tournament} ${r.round}: ${f}`);
                        const opensource = `${r.caselist}/${r.school}/${r.team}/${f}`;
                        await query(SQL`
                            UPDATE rounds SET opensource = ${opensource} WHERE round_id = ${r.round_id} AND opensource IS NULL LIMIT 1
                        `);
                    }
                }
            } catch (err) {
                // Do nothing
            }
        });
    }

    console.log('Finished fixing neg open source.');
    pool.end();

    return true;
};

fixNegOpenSource();

export default fixNegOpenSource;
