import SQL from 'sql-template-strings';
import { query } from '../v1/helpers/mysql';

const testFixtures = async () => {
    await query(SQL`
        INSERT INTO caselists (caselist_id, name, display_name, year, event, level, team_size, archived) VALUES
            (1, 'testcaselist', 'Test Caselist', 2022, 'cx', 'hs', 2, 0),
            (2, 'archivedcaselist', 'Archived Caselist', 2022, 'cx', 'hs', 2, 1);
    `);

    await query(SQL`
        INSERT INTO schools (school_id, caselist_id, name, display_name, state, chapter_id) VALUES
            (1, 1, 'testschool', 'Test School', NULL, 1);
    `);

    await query(SQL`
        INSERT INTO teams (team_id, school_id, display_name, name, notes, debater1_first, debater1_last, debater2_first, debater2_last) VALUES
            (1, 1, 'Test Team', 'testteam', 'Sample Notes', 'Aaron', 'Hardy', 'Chris', 'Palmer');
    `);

    await query(SQL`
        INSERT INTO rounds (round_id, team_id, side, tournament, round, opponent, judge, report, tourn_id, external_id) VALUES
            (1, 1, 'A', 'Test Tournament', '1', 'Evil Empire XX', 'Hardy', 'Report', 1234, 1234),
            (2, 1, 'N', 'Test Tournament', '2', 'Evil Empire YY', 'Hardy', 'Report', 1234, 1234);
    `);

    await query(SQL`
        INSERT INTO cites (cite_id, round_id, title, cites) VALUES
            (1, 1, 'Test Aff Title', '# Aff Cites'),
            (2, 2, 'Test Neg Title', '# Neg Cites');
    `);

    await query(SQL`
        INSERT INTO openev (openev_id, name, path, year, camp, lab, tags) VALUES
            (1, '/openev/2022/Test/Test.docx', 'Test.docx', 2022, 'Test', 'AA', '{"da":true,"cp":true}');
    `);

    await query(SQL`
        INSERT INTO users (user_id, email, display_name) VALUES
            (1, 'test@test.com', 'Test User')
    `);

    // token = SHA256 hash of 'test'
    await query(SQL`
        INSERT INTO sessions (session_id, token, user_id, expires_at) VALUES
            (1, '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', 1, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY))
    `);
};

export default testFixtures;
