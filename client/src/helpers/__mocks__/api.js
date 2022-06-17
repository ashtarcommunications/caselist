import { createBrowserHistory } from 'history';

export const history = createBrowserHistory();

// Jest will only use mock implementations defined here if resetMocks: false is set in package.json
// Otherwise, you have to copy the mockResolveValue to each test and define the response on the imported mock
// https://github.com/facebook/jest/issues/10894
// https://github.com/facebook/create-react-app/issues/9935
export const login = jest.fn().mockResolvedValue({ message: 'Successfully logged in ' });
export const loadCaselists = jest.fn().mockResolvedValue([{ caselist_id: 1, name: 'testcaselist', display_name: 'Test Caselist', year: 2022 }]);
export const loadCaselist = jest.fn().mockResolvedValue({ caselist_id: 1, name: 'Test Caselist' });
export const loadRecent = jest.fn().mockResolvedValue([{ team_id: 1, team_display_name: 'Test Team' }]);
export const loadSchools = jest.fn().mockResolvedValue([]);
export const addSchool = jest.fn().mockResolvedValue({ school_id: 1, name: 'Test School' });
export const loadSchool = jest.fn().mockResolvedValue({});
export const loadTeams = jest.fn().mockResolvedValue([{ team_id: 1, name: 'testteam', display_name: 'Test Team', debater1_first: 'Aaron', debater1_last: 'Hardy' }]);
export const addTeam = jest.fn().mockResolvedValue({ message: 'Successfully added team' });
export const updateTeam = jest.fn().mockResolvedValue({ message: 'Successfully updated team' });
export const loadTeam = jest.fn().mockResolvedValue({});
export const deleteTeam = jest.fn().mockResolvedValue({ message: 'Successfully deleted team' });
export const loadRounds = jest.fn().mockResolvedValue([]);
export const addRound = jest.fn().mockResolvedValue({ message: 'Successfully added round' });
export const loadRound = jest.fn().mockResolvedValue({ round_id: 1, tournament: 'Tournament', side: 'A', round: '1', judge: 'Judge', opponent: 'Opponent', report: 'Report', opensource: '/test.docx', video: 'Video' });
export const updateRound = jest.fn().mockResolvedValue({ message: 'Successfully updated round' });
export const deleteRound = jest.fn().mockResolvedValue({ message: 'Successfully deleted round' });
export const addCite = jest.fn().mockResolvedValue({ message: 'Successfully added cite' });
export const loadCites = jest.fn().mockResolvedValue([]);
export const deleteCite = jest.fn().mockResolvedValue({ message: 'Successfully deleted cite' });
export const loadTabroomChapters = jest.fn().mockResolvedValue([{ id: 1, name: 'Tabroom School', state: 'CO' }]);
export const loadTabroomRounds = jest.fn().mockResolvedValue([{ id: 1, tournament: 'Test Tournament', side: 'A', round: '1', opponent: 'Opponent', judge: 'Judge' }]);
export const loadTabroomStudents = jest.fn().mockResolvedValue([{ id: 1, first: 'Aaron', last: 'Hardy', name: 'Aaron Hardy' }]);
export const addTabroomLink = jest.fn().mockResolvedValue({ message: 'Successfully added link' });
export const loadOpenEvFiles = jest.fn().mockResolvedValue([]);
export const addOpenEvFile = jest.fn().mockResolvedValue({ message: 'Successfully added file' });
export const deleteOpenEvFile = jest.fn().mockResolvedValue({ message: 'Successfully deleted file' });
export const downloadFile = jest.fn().mockResolvedValue({ blob: () => true });
export const loadSearch = jest.fn().mockResolvedValue([{ type: 'team', team_id: 1, path: '/', downloadPath: '/', shard: 'test', team_display_name: 'Test Team', title: 'Test Cite', snippet: 'Test Snippet' }]);

export default null;
