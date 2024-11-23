// #!/usr/bin/env node
// Invoke from CLI like:
// node --experimental-specifier-resolution=node v1/migration/deleteCaselist.js
/* istanbul ignore file */

import SQL from 'sql-template-strings';
import { query, pool } from '../helpers/mysql.js';

const deleteCaselist = async () => {
    // Change this to the caselist - not automated because this is so destructive
    const caselist = 'opencaselist14';

    await query(SQL`
        DELETE CT.*
        FROM cites CT
        INNER JOIN rounds R ON R.round_id = CT.round_id
        INNER JOIN teams T ON T.team_id = R.team_id
        INNER JOIN schools S ON S.school_id = T.school_id
        INNER JOIN caselists C ON C.caselist_id = S.caselist_id
        WHERE C.name = ${caselist}
    `);

    await query(SQL`
        DELETE R.*
        FROM rounds R
        INNER JOIN teams T ON T.team_id = R.team_id
        INNER JOIN schools S ON S.school_id = T.school_id
        INNER JOIN caselists C ON C.caselist_id = S.caselist_id
        WHERE C.name = ${caselist}
    `);

    await query(SQL`
        DELETE T.*
        FROM teams T
        INNER JOIN schools S ON S.school_id = T.school_id
        INNER JOIN caselists C ON C.caselist_id = S.caselist_id
        WHERE C.name = ${caselist}
    `);

    await query(SQL`
        DELETE S.*
        FROM schools S
        INNER JOIN caselists C ON C.caselist_id = S.caselist_id
        WHERE C.name = ${caselist}
    `);

    await query(SQL`
        DELETE FROM caselists WHERE name = ${caselist}
    `);

    pool.end();
};

deleteCaselist();

export default deleteCaselist;
