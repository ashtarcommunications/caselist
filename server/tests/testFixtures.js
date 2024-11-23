import SQL from 'sql-template-strings';
import { startOfYear } from '@speechanddebate/nsda-js-utils';
import { query } from '../v1/helpers/mysql.js';

const testFixtures = async () => {
    await query(SQL`
        INSERT INTO caselists (caselist_id, name, display_name, year, event, level, team_size, archived) VALUES
            (1, 'testcaselist', 'Test Caselist', 2022, 'cx', 'hs', 2, 0),
            (2, 'archivedcaselist', 'Archived Caselist', 2022, 'cx', 'hs', 2, 1);
    `);

    await query(SQL`
        INSERT INTO schools (school_id, caselist_id, name, display_name, state, chapter_id) VALUES
            (1, 1, 'testschool', 'Test School', NULL, 1),
            (2, 2, 'archivedschool', 'Archived School', NULL, 1);
    `);

    await query(SQL`
        INSERT INTO teams (team_id, school_id, display_name, name, notes, debater1_first, debater1_last, debater2_first, debater2_last) VALUES
            (1, 1, 'Test Team', 'testteam', 'Sample Notes', 'Aaron', 'Hardy', 'Chris', 'Palmer'),
            (2, 2, 'Archived Team', 'archivedteam', 'Sample Notes', 'Aaron', 'Hardy', 'Chris', 'Palmer');
    `);

    await query(SQL`
        INSERT INTO teams_history (event, version, team_id, school_id, display_name, name, notes, debater1_first, debater1_last, debater2_first, debater2_last, updated_by_id) VALUES
            ('test', 1, 1, 1, 'Test Team', 'testteam', 'Sample Notes', 'Aaron', 'Hardy', 'Chris', 'Palmer', 1);
    `);

    await query(SQL`
        INSERT INTO rounds (round_id, team_id, side, tournament, round, opponent, judge, report, opensource, tourn_id, external_id) VALUES
            (1, 1, 'A', 'Test Tournament', '1', 'Evil Empire XX', 'Hardy', 'Report', 'test.docx', 1234, 1234),
            (2, 1, 'N', 'Test Tournament', '2', 'Evil Empire YY', 'Hardy', 'Report', 'test.docx', 1234, 1234),
            (3, 2, 'A', 'Archived Round', '1', 'Evil Empire XX', 'Hardy', 'Report', 'test.docx', 1234, 1234);
    `);

    await query(SQL`
        INSERT INTO rounds_history (event, version, round_id, team_id, side, tournament, round, opponent, judge, report, opensource, tourn_id, external_id, updated_by_id) VALUES
            ('test', 1, 1, 1, 'A', 'Test Tournament', '1', 'Evil Empire XX', 'Hardy', 'Report', 'test.docx', 1234, 1234, 1);
    `);

    await query(SQL`
        INSERT INTO cites (cite_id, round_id, title, cites) VALUES
            (1, 1, 'Test Aff Title', '# Aff Cites'),
            (2, 2, 'Test Neg Title', '# Neg Cites'),
            (3, 3, 'Archived Cite', '# Archived Cite');
    `);

    await query(SQL`
        INSERT INTO cites_history (event, version, cite_id, round_id, title, cites, updated_by_id) VALUES
            ('test', 1, 1, 1, 'Test Aff Title', '# Aff Cites', 1);
    `);

    await query(SQL`
        INSERT INTO openev (openev_id, name, path, year, camp, lab, tags) VALUES
            (1, 'Test.docx', 'openev/2022/Test/Test.docx', ${startOfYear}, 'Test', 'AA', '{"da":true,"cp":true}'),
            (2, 'archived', 'openev/archived', 2020, 'Test', 'BB', '{"da":true,"cp":true}');
    `);

    await query(SQL`
        INSERT INTO users (user_id, email, display_name, trusted) VALUES
            (1, 'test@test.com', 'Test User', 1),
            (2, 'user@test.com', 'Non-Admin', 1),
            (3, 'untrusted@test.com', 'Untrusted', 0);

    `);

    // token = SHA256 hash of 'test' (1), 'user' (2), and 'untrusted' (3)
    await query(SQL`
        INSERT INTO sessions (session_id, token, user_id, expires_at) VALUES
            (1, '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', 1, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY)),
            (2, '04f8996da763b7a969b1028ee3007569eaf3a635486ddab211d512c85b9df8fb', 2, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY)),
            (3, '6353de988bb15f611bd2eb9ca3a62eb2aeda604e2fdd570802f5c15404c073e3', 3, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY));
    `);
};

export default testFixtures;
