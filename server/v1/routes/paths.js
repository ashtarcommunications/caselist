import status from '../controllers/status/status';

import getCaselists from '../controllers/caselists/getCaselists';
import getSchools from '../controllers/schools/getSchools';
import postSchool from '../controllers/schools/postSchool';

import getTeams from '../controllers/teams/getTeams';
import postTeam from '../controllers/teams/postTeam';
import deleteTeam from '../controllers/teams/deleteTeam';

export default [
    { path: '/status', module: status },

    { path: '/caselists', module: getCaselists },

    { path: '/{caselist}/schools', module: { ...getSchools, ...postSchool } },

    { path: '/{caselist}/{school}', module: { ...getTeams, ...postTeam } },
    { path: '/{caselist}/{school}/{team}', module: deleteTeam },
];
