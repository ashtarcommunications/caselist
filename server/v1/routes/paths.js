import status from '../controllers/status/status';

import getCaselists from '../controllers/caselists/getCaselists';
import getCaselist from '../controllers/caselists/getCaselist';
import getRecent from '../controllers/caselists/getRecent';
import getSchool from '../controllers/schools/getSchool';
import getSchools from '../controllers/schools/getSchools';
import postSchool from '../controllers/schools/postSchool';

import getTeam from '../controllers/teams/getTeam';
import getTeams from '../controllers/teams/getTeams';
import postTeam from '../controllers/teams/postTeam';
import deleteTeam from '../controllers/teams/deleteTeam';

import getRound from '../controllers/rounds/getRound';
import getRounds from '../controllers/rounds/getRounds';
import postRound from '../controllers/rounds/postRound';
import putRound from '../controllers/rounds/putRound';
import deleteRound from '../controllers/rounds/deleteRound';
import getCites from '../controllers/rounds/getCites';
import deleteCite from '../controllers/rounds/deleteCite';

import postLogin from '../controllers/login/postLogin';

import getTabroomChapters from '../controllers/tabroom/getTabroomChapters';
import getTabroomTeams from '../controllers/tabroom/getTabroomTeams';
import getTabroomRounds from '../controllers/tabroom/getTabroomRounds';
import postTabroomTeamLink from '../controllers/tabroom/postTabroomTeamLink';

export default [
    { path: '/status', module: status },

    { path: '/login', module: postLogin },

    { path: '/caselists', module: getCaselists },
    { path: '/caselists/{caselist}', module: getCaselist },
    { path: '/caselists/{caselist}/recent', module: getRecent },

    { path: '/caselists/{caselist}/schools', module: { ...getSchools, ...postSchool } },

    { path: '/caselists/{caselist}/schools/{school}', module: getSchool },

    { path: '/caselists/{caselist}/schools/{school}/teams', module: { ...getTeams, ...postTeam } },
    { path: '/caselists/{caselist}/schools/{school}/teams/{team}', module: { ...getTeam, ...deleteTeam } },
    { path: '/caselists/{caselist}/schools/{school}/teams/{team}/rounds', module: { ...getRounds, ...postRound } },

    { path: '/caselists/{caselist}/schools/{school}/teams/{team}/rounds/{round}', module: { ...getRound, ...putRound, ...deleteRound } },
    { path: '/caselists/{caselist}/schools/{school}/teams/{team}/cites', module: { ...getCites } },
    { path: '/caselists/{caselist}/schools/{school}/teams/{team}/cites/{cite}', module: { ...deleteCite } },

    { path: '/tabroom/chapters', module: getTabroomChapters },
    { path: '/tabroom/teams', module: { ...getTabroomTeams, ...postTabroomTeamLink } },
    { path: '/tabroom/rounds', module: getTabroomRounds },
];
