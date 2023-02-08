import status from '../controllers/status/status';

import getSearch from '../controllers/search/getSearch';

import getCaselists from '../controllers/caselists/getCaselists';
import getCaselist from '../controllers/caselists/getCaselist';
import getRecent from '../controllers/caselists/getRecent';
import getBulkDownloads from '../controllers/caselists/getBulkDownloads';
import getSchool from '../controllers/schools/getSchool';
import getSchools from '../controllers/schools/getSchools';
import postSchool from '../controllers/schools/postSchool';

import getTeam from '../controllers/teams/getTeam';
import getTeams from '../controllers/teams/getTeams';
import postTeam from '../controllers/teams/postTeam';
import patchTeam from '../controllers/teams/patchTeam';
import deleteTeam from '../controllers/teams/deleteTeam';

import getRound from '../controllers/rounds/getRound';
import getRounds from '../controllers/rounds/getRounds';
import postRound from '../controllers/rounds/postRound';
import putRound from '../controllers/rounds/putRound';
import deleteRound from '../controllers/rounds/deleteRound';

import getCites from '../controllers/cites/getCites';
import postCite from '../controllers/cites/postCite';
import deleteCite from '../controllers/cites/deleteCite';

import postLogin from '../controllers/login/postLogin';

import getTabroomChapters from '../controllers/tabroom/getTabroomChapters';
import getTabroomStudents from '../controllers/tabroom/getTabroomStudents';
import getTabroomRounds from '../controllers/tabroom/getTabroomRounds';
import postTabroomLink from '../controllers/tabroom/postTabroomLink';

import getFiles from '../controllers/openev/getFiles';
import postFile from '../controllers/openev/postFile';
import deleteFile from '../controllers/openev/deleteFile';

import getDownload from '../controllers/download/getDownload';

export default [
    { path: '/status', module: status },

    { path: '/login', module: postLogin },

    { path: '/search', module: getSearch },

    { path: '/caselists', module: getCaselists },
    { path: '/caselists/{caselist}', module: getCaselist },
    { path: '/caselists/{caselist}/recent', module: getRecent },
    { path: '/caselists/{caselist}/downloads', module: getBulkDownloads },

    { path: '/caselists/{caselist}/schools', module: { ...getSchools, ...postSchool } },

    { path: '/caselists/{caselist}/schools/{school}', module: getSchool },

    { path: '/caselists/{caselist}/schools/{school}/teams', module: { ...getTeams, ...postTeam } },
    { path: '/caselists/{caselist}/schools/{school}/teams/{team}', module: { ...getTeam, ...patchTeam, ...deleteTeam } },
    { path: '/caselists/{caselist}/schools/{school}/teams/{team}/rounds', module: { ...getRounds, ...postRound } },

    { path: '/caselists/{caselist}/schools/{school}/teams/{team}/rounds/{round}', module: { ...getRound, ...putRound, ...deleteRound } },
    { path: '/caselists/{caselist}/schools/{school}/teams/{team}/cites', module: { ...getCites, ...postCite } },
    { path: '/caselists/{caselist}/schools/{school}/teams/{team}/cites/{cite}', module: { ...deleteCite } },

    { path: '/tabroom/chapters', module: getTabroomChapters },
    { path: '/tabroom/rounds', module: getTabroomRounds },
    { path: '/tabroom/students', module: getTabroomStudents },
    { path: '/tabroom/link', module: postTabroomLink },

    { path: '/openev', module: { ...getFiles, ...postFile } },
    { path: '/openev/{id}', module: deleteFile },

    { path: '/download', module: getDownload },
];
