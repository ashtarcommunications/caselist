import status from '../controllers/status/status';

import getCaselists from '../controllers/caselists/getCaselists';
import getSchool from '../controllers/schools/getSchool';
import getSchools from '../controllers/schools/getSchools';
import postSchool from '../controllers/schools/postSchool';

import getTeams from '../controllers/teams/getTeams';
import postTeam from '../controllers/teams/postTeam';
import deleteTeam from '../controllers/teams/deleteTeam';

import getRounds from '../controllers/rounds/getRounds';

import postLogin from '../controllers/login/postLogin';

export default [
    { path: '/status', module: status },

    { path: '/login', module: postLogin },

    { path: '/caselists', module: getCaselists },

    { path: '/{caselist}/schools', module: { ...getSchools, ...postSchool } },

    { path: '/{caselist}/schools/{school}', module: getSchool },

    { path: '/{caselist}/schools/{school}/teams', module: { ...getTeams, ...postTeam } },
    { path: '/{caselist}/schools/{school}/teams/{team}', module: deleteTeam },
    { path: '/{caselist}/schools/{school}/teams/{team}/rounds', module: getRounds },
];
