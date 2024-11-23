import { createBrowserHistory } from 'history';
import { vi } from 'vitest';

export const history = createBrowserHistory();

export const login = vi.fn().mockResolvedValue({ message: 'Successfully logged in ' });
export const loadCaselists = vi.fn().mockResolvedValue([{ caselist_id: 1, name: 'testcaselist', display_name: 'Test Caselist', year: 2022 }]);
export const loadCaselist = vi.fn().mockResolvedValue({ caselist_id: 1, name: 'Test Caselist' });
export const loadRecent = vi.fn().mockResolvedValue([{ round_id: 1, team_id: 1, team_display_name: 'Test Team', opensource: '/test' }]);
export const loadDownloads = vi.fn().mockResolvedValue([
    { name: 'testcaselist-all.zip', url: 'https://caselist-files.s3.amazon.com/weekly/test/testcaselist-all.zip' },
    { name: 'testcaselist-weekly.zip', url: 'https://caselist-files.s3.amazon.com/weekly/test/testcaselist-weekly.zip' },
]);
export const loadSchools = vi.fn().mockResolvedValue([]);
export const addSchool = vi.fn().mockResolvedValue({ school_id: 1, name: 'Test School' });
export const loadSchool = vi.fn().mockResolvedValue({});
export const loadSchoolHistory = vi.fn().mockResolvedValue([{ description: 'Test school history', updated_at: '2023', updated_by: 'Test User' }]);
export const loadTeams = vi.fn().mockResolvedValue([{ team_id: 1, name: 'testteam', display_name: 'Test Team', debater1_first: 'Aaron', debater1_last: 'Hardy', updated_by: 'Test User' }]);
export const addTeam = vi.fn().mockResolvedValue({ message: 'Successfully added team' });
export const updateTeam = vi.fn().mockResolvedValue({ message: 'Successfully updated team' });
export const loadTeam = vi.fn().mockResolvedValue({ team_id: 1, name: 'testteam', display_name: 'Test Team', debater1_first: 'Aaron', debater1_last: 'Hardy', updated_by: 'Test User' });
export const deleteTeam = vi.fn().mockResolvedValue({ message: 'Successfully deleted team' });
export const loadTeamHistory = vi.fn().mockResolvedValue([{ description: 'Test team history', updated_at: '2023', updated_by: 'Test User' }]);
export const loadRounds = vi.fn().mockResolvedValue([
    { round_id: 1, tournament: 'Aff Tournament', side: 'A', round: '1', judge: 'Judge', opponent: 'Opponent', report: 'Report', opensource: '/test.docx', video: 'Video' },
    { round_id: 2, tournament: 'Neg Tournament', side: 'N', round: '2', judge: 'Judge', opponent: 'Opponent', report: 'Report', opensource: '/test.docx', video: 'Video' },
]);
export const addRound = vi.fn().mockResolvedValue({ message: 'Successfully added round' });
export const loadRound = vi.fn().mockResolvedValue({ round_id: 1, tournament: 'Tournament', side: 'A', round: '1', judge: 'Judge', opponent: 'Opponent', report: 'Report', opensource: '/test.docx', video: 'Video' });
export const updateRound = vi.fn().mockResolvedValue({ message: 'Successfully updated round' });
export const deleteRound = vi.fn().mockResolvedValue({ message: 'Successfully deleted round' });
export const addCite = vi.fn().mockResolvedValue({ message: 'Successfully added cite' });
export const loadCites = vi.fn().mockResolvedValue([{ cite_id: 1, round_id: 1, title: 'Title', cites: 'Test Cites' }]);
export const deleteCite = vi.fn().mockResolvedValue({ message: 'Successfully deleted cite' });
export const loadTabroomChapters = vi.fn().mockResolvedValue([{ id: 1, name: 'Tabroom School', state: 'CO' }]);
export const loadTabroomRounds = vi.fn().mockResolvedValue([{ id: 1, tournament: 'Test Tournament', side: 'A', round: '1', opponent: 'Opponent', judge: 'Judge' }]);
export const loadTabroomStudents = vi.fn().mockResolvedValue([{ id: 1, first: 'Aaron', last: 'Hardy', name: 'Aaron Hardy' }]);
export const addTabroomLink = vi.fn().mockResolvedValue({ message: 'Successfully added link' });
export const loadOpenEvFiles = vi.fn().mockResolvedValue([]);
export const addOpenEvFile = vi.fn().mockResolvedValue({ message: 'Successfully added file' });
export const deleteOpenEvFile = vi.fn().mockResolvedValue({ message: 'Successfully deleted file' });
export const downloadFile = vi.fn().mockResolvedValue({ blob: () => true });
export const loadSearch = vi.fn().mockResolvedValue([{ type: 'team', team_id: 1, path: '/', downloadPath: '/', shard: 'test', team_display_name: 'Test Team', title: 'Test Cite', snippet: 'Test Snippet' }]);

export default null;
