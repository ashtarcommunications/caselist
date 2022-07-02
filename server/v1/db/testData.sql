INSERT INTO caselists (caselist_id, name, display_name, year, event, level, team_size, archived) VALUES
    (1001, 'ndtceda22', 'NDT/CEDA 2022-23', 2022, 'cx', 'college', 2, 0),
    (1002, 'hspolicy22', 'HS Policy 2022-23', 2022, 'cx', 'hs', 2, 0),
    (1003, 'hsld22', 'HS LD 2022-23', 2022, 'ld', 'hs', 1, 0),
    (1004, 'hspf22', 'HS PF 2022-23', 2022, 'pf', 'hs', 2, 0),
    (1005, 'nfald22', 'NFA LD 2022-23', 2022, 'ld', 'college', 1, 0);

INSERT INTO schools (school_id, caselist_id, name, display_name, state, chapter_id) VALUES
    (1001, 1001, 'Northwestern', 'Northwestern', NULL, 1),
    (1002, 1002, 'Policy', 'Policy', 'CO', 1),
    (1003, 1003, 'LD', 'LD', 'CO', 1),
    (1004, 1004, 'PF', 'PF', 'CO', 1),
    (1005, 1005, 'NFA', 'NFA', NULL, 1);

INSERT INTO teams (team_id, school_id, display_name, name, notes, debater1_first, debater1_last, debater2_first, debater2_last) VALUES
    (1001, 1001, 'Northwestern HaPa', 'HaPa', 'Sample Notes', 'Aaron', 'Hardy', 'Chris', 'Palmer'),
    (1002, 1002, 'Policy SmSm', 'SmSm', 'Sample Notes', 'Jane', 'Smith', 'John', 'Smith'),
    (1003, 1003, 'LD DoDo', 'DoDo', 'Sample Notes', 'John', 'Doe', 'Jane', 'Doe'),
    (1004, 1004, 'PF PuFo', 'PuFo', 'Sample Notes', 'Public', 'Public', 'Forum', 'Forum'),
    (1005, 1005, 'NFA NaFo', 'NaFo', 'Sample Notes', 'National', 'National', 'Forensics', 'Forensics');

INSERT INTO rounds (round_id, team_id, side, tournament, round, opponent, judge, report, tourn_id, external_id) VALUES
    (1001, 1001, 'A', 'Test Tournament', '1', 'Evil Empire XX', 'Hardy', 'Report', 1234, 1234),
    (1002, 1001, 'N', 'Test Tournament', '2', 'Evil Empire YY', 'Hardy', 'Report', 1234, 1234);

INSERT INTO cites (cite_id, round_id, title, cites) VALUES
    (1001, 1001, 'Test Aff Title', '# Test 1AC\n## Heading Two\n### This is some aff cites and stuff'),
    (1002, 1002, 'Test Neg Title', '# Test 1NC\n## Heading Two\n### neg cites and stuff');

INSERT INTO openev (openev_id, path, name, year, camp, lab, tags) VALUES
    (1001, '/openev/2022/SDI/AA/Test.docx', 'Test.docx', 2022, 'SDI', 'AA', '{"da":true,"cp":true}'),
    (1002, '/openev/2022/CNDI/BB/Test2.docx', 'Test2.docx', 2022, 'CNDI', 'BB', '{"k":true,"aff":true}');
