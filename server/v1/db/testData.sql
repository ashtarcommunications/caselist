INSERT INTO caselists (caselist_id, slug, name, year, event) VALUES
    (1, 'ndtceda21', 'NDT/CEDA 2021-22', 2021, 'cx'),
    (2, 'hspolicy21', 'HS Policy 2021-22', 2021, 'cx'),
    (3, 'hsld21', 'HS LD 2021-22', 2021, 'ld'),
    (4, 'hspf21', 'HS Public Forum 2021-22', 2021, 'pf'),
    (5, 'nfald21', 'NFA LD 2021-22', 2021, 'ld');

INSERT INTO schools (school_id, caselist_id, name, display_name, state, chapter_id) VALUES
    (1, 1, 'Northwestern', 'Northwestern', NULL, 1),
    (2, 2, 'Policy', 'Policy', 'CO', 1),
    (3, 3, 'LD', 'LD', 'CO', 1),
    (4, 4, 'PF', 'PF', 'CO', 1),
    (5, 5, 'NFA', 'NFA', NULL, 1);

INSERT INTO teams (team_id, school_id, name, code, debater1_first, debater1_last, debater2_first, debater2_last) VALUES
    (1, 1, 'Northwestern XaXb', 'XaXb', 'XaFirst', 'XaLast', 'XbFirst', 'XbLast'),
    (2, 2, 'Policy XaXb', 'XaXb', 'XaFirst', 'XaLast', 'XbFirst', 'XbLast'),
    (3, 3, 'LD XaXb', 'XaXb', 'XaFirst', 'XaLast', 'XbFirst', 'XbLast'),
    (4, 4, 'PF XaXb', 'XaXb', 'XaFirst', 'XaLast', 'XbFirst', 'XbLast'),
    (5, 5, 'NFA XaXb', 'XaXb', 'XaFirst', 'XaLast', 'XbFirst', 'XbLast');

INSERT INTO rounds (round_id, team_id, side, tournament, round, opponent, judge, report, tourn_id, external_id) VALUES
    (1, 1, 'Aff', 'Test Tournament', 'Round 1', 'Evil Empire XX', 'Hardy', 'Report', 1234, 1234),
    (2, 1, 'Neg', 'Test Tournament', 'Round 2', 'Evil Empire YY', 'Hardy', 'Report', 1234, 1234);