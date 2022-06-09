import SQL from 'sql-template-strings';
import { pool, query } from '../helpers/mysql';

const years = [2017, 2018, 2019, 2020];
years.forEach(async (y) => {
    await query(SQL`
        INSERT INTO caselists (name, display_name, year, event, level, team_size, archived) VALUES
            ('ndtceda${y.toString().slice(-2)}', 'NDT/CEDA ${y}', ${y}, 'cx', 'college', 2, 1),
            ('hspolicy${y.toString().slice(-2)}', 'HS Policy ${y}', ${y}, 'cx', 'hs', 2, 1),
            ('hsld${y.toString().slice(-2)}', 'HS LD ${y}', ${y}, 'ld', 'hs', 1, 1),
            ('hspf${y.toString().slice(-2)}', 'HS PF ${y}', ${y}, 'pf', 'hs', 2, 1),
            ('nfald${y.toString().slice(-2)}', 'NFA LD ${y}', ${y}, 'ld', 'college', 1, 1);
    `);
});

const schools = [
    'AmherstHarvard',
    'Army',
    'Baylor',
    'Binghamton',
    'Boston College',
    'Cal Berkeley',
    'Central Oklahoma',
    'Cornell',
    'CSU Fullerton',
    'CSU Northridge',
    'Dartmouth',
    'Emory University',
    'Emporia State',
    'George Mason',
    'Georgetown',
    'Georgia',
    'Georgia State',
    'Gonzaga',
    'Harvard',
    'Houston',
    'Indiana',
    'Iowa',
    'James Madison',
    'JCCC',
    'Kansas',
    'Kansas State',
    'Kentucky',
    'Liberty University',
    'Macalester',
    'Mary Washington',
    'Miami',
    'Michigan',
    'Michigan State University',
    'Minnesota',
    'Missouri State',
    'Navy',
    'New School',
    'NYU',
    'Oakton',
    'Oklahoma',
    'Pittsburgh',
    'Rochester',
    'Rutgers',
    'Samford',
    'Southern California',
    'Texas',
    'Texas Tech',
    'Trinity',
    'Tufts University',
    'UTD',
    'Wake Forest University',
    'Washington',
    'Washington University',
    'Wayne State',
    'West Georgia',
    'Western Washington University',
    'Wichita State',
    'Wyoming',
];
schools.forEach(async (s) => {
    await query(SQL`
        INSERT INTO schools (caselist_id, name, display_name, state, chapter_id) VALUES
            (1001, ${s.replaceAll(' ', '')}, ${s}, NULL, 1)
    `);
});

setTimeout(() => {
    pool.end();
}, 1000);
