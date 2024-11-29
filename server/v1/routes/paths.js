import status from '../controllers/status/status.js';

import getSearch from '../controllers/search/getSearch.js';

import getCaselists from '../controllers/caselists/getCaselists.js';
import getCaselist from '../controllers/caselists/getCaselist.js';
import getRecent from '../controllers/caselists/getRecent.js';
import getBulkDownloads from '../controllers/caselists/getBulkDownloads.js';
import getSchool from '../controllers/schools/getSchool.js';
import getSchools from '../controllers/schools/getSchools.js';
import postSchool from '../controllers/schools/postSchool.js';
import getSchoolHistory from '../controllers/schools/getSchoolHistory.js';

import getTeam from '../controllers/teams/getTeam.js';
import getTeams from '../controllers/teams/getTeams.js';
import postTeam from '../controllers/teams/postTeam.js';
import patchTeam from '../controllers/teams/patchTeam.js';
import deleteTeam from '../controllers/teams/deleteTeam.js';
import getTeamHistory from '../controllers/teams/getTeamHistory.js';

import getRound from '../controllers/rounds/getRound.js';
import getRounds from '../controllers/rounds/getRounds.js';
import postRound from '../controllers/rounds/postRound.js';
import putRound from '../controllers/rounds/putRound.js';
import deleteRound from '../controllers/rounds/deleteRound.js';

import getCites from '../controllers/cites/getCites.js';
import postCite from '../controllers/cites/postCite.js';
import deleteCite from '../controllers/cites/deleteCite.js';

import postLogin from '../controllers/login/postLogin.js';

import getTabroomChapters from '../controllers/tabroom/getTabroomChapters.js';
import getTabroomStudents from '../controllers/tabroom/getTabroomStudents.js';
import getTabroomRounds from '../controllers/tabroom/getTabroomRounds.js';
import postTabroomLink from '../controllers/tabroom/postTabroomLink.js';

import getFiles from '../controllers/openev/getFiles.js';
import postFile from '../controllers/openev/postFile.js';
import deleteFile from '../controllers/openev/deleteFile.js';

import getDownload from '../controllers/download/getDownload.js';

export default [
	{ path: '/status', module: status },

	{ path: '/login', module: postLogin },

	{ path: '/search', module: getSearch },

	{ path: '/caselists', module: getCaselists },
	{ path: '/caselists/{caselist}', module: getCaselist },
	{ path: '/caselists/{caselist}/recent', module: getRecent },
	{ path: '/caselists/{caselist}/downloads', module: getBulkDownloads },

	{
		path: '/caselists/{caselist}/schools',
		module: { ...getSchools, ...postSchool },
	},

	{ path: '/caselists/{caselist}/schools/{school}', module: getSchool },

	{
		path: '/caselists/{caselist}/schools/{school}/history',
		module: { ...getSchoolHistory },
	},
	{
		path: '/caselists/{caselist}/schools/{school}/teams',
		module: { ...getTeams, ...postTeam },
	},
	{
		path: '/caselists/{caselist}/schools/{school}/teams/{team}',
		module: { ...getTeam, ...patchTeam, ...deleteTeam },
	},
	{
		path: '/caselists/{caselist}/schools/{school}/teams/{team}/history',
		module: { ...getTeamHistory },
	},
	{
		path: '/caselists/{caselist}/schools/{school}/teams/{team}/rounds',
		module: { ...getRounds, ...postRound },
	},

	{
		path: '/caselists/{caselist}/schools/{school}/teams/{team}/rounds/{round}',
		module: { ...getRound, ...putRound, ...deleteRound },
	},
	{
		path: '/caselists/{caselist}/schools/{school}/teams/{team}/cites',
		module: { ...getCites, ...postCite },
	},
	{
		path: '/caselists/{caselist}/schools/{school}/teams/{team}/cites/{cite}',
		module: { ...deleteCite },
	},

	{ path: '/tabroom/chapters', module: getTabroomChapters },
	{ path: '/tabroom/rounds', module: getTabroomRounds },
	{ path: '/tabroom/students', module: getTabroomStudents },
	{ path: '/tabroom/link', module: postTabroomLink },

	{ path: '/openev', module: { ...getFiles, ...postFile } },
	{ path: '/openev/{id}', module: deleteFile },

	{ path: '/download', module: getDownload },
];
