import { createBrowserHistory } from 'history';
import { toast } from 'react-toastify';
import fetch from './fetch-retry';

/* Hacky HistoryRouter kludge for react-router v6 */
/* https://github.com/remix-run/react-router/issues/8264 */
export const history = createBrowserHistory();

export const fetchBase = async (path, options = {}, body = {}) => {
    const base = process.env.REACT_APP_API_BASE;
    const fetchOptions = {
        method: options.method ? options.method : 'GET',
        body: body instanceof FormData ? body : JSON.stringify(body),
        maxRetries: (options.method && options.method !== 'GET') ? 0 : 3,
        retryDelay: process.env.NODE_ENV === 'test' ? 10 : 100,
        credentials: 'include',
        headers: body instanceof FormData ? {} : {
            'Content-Type': 'application/json',
        },
        ...options,
    };

    if (fetchOptions.method === 'GET') { delete fetchOptions.body; }

    try {
        const response = await fetch(`${base}/${path}`, fetchOptions);
        return options.raw ? response : response.json();
    } catch (err) {
        if (err.statusCode === 401) {
            history.push('/login');
            return false;
        }
        if (err.statusCode === 404) {
            history.push('/404');
            return false;
        }
        if (err.statusCode === 429) {
            toast.error(err.message);
            return false;
        }
        history.push('/error', { statusCode: err.statusCode, message: err.message });
        throw new Error(err);
    }
};

export const login = async (username, password) => {
    return fetchBase(`login`, { method: 'POST' }, { username, password });
};

export const loadCaselists = async (archived) => {
    return fetchBase(`caselists?archived=${archived ? 'true' : 'false'}`);
};

export const loadCaselist = async (caselist) => {
    return fetchBase(`caselists/${caselist}`);
};

export const loadRecent = async (caselist) => {
    return fetchBase(`caselists/${caselist}/recent`);
};

export const loadSchools = async (caselist) => {
    return fetchBase(`caselists/${caselist}/schools`);
};

export const addSchool = async (caselist, school) => {
    return fetchBase(`caselists/${caselist}/schools`, { method: 'POST' }, school);
};

export const loadSchool = async (caselist, school) => {
    return fetchBase(`caselists/${caselist}/schools/${school}`);
};

export const loadTeams = async (caselist, school) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams`);
};

export const addTeam = async (caselist, school, team) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams`, { method: 'POST' }, team);
};

export const updateTeam = async (caselist, school, team, updates) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams/${team}`, { method: 'PATCH' }, updates);
};

export const loadTeam = async (caselist, school, team) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams/${team}`);
};

export const deleteTeam = async (caselist, school, team) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams/${team}`, { method: 'DELETE' });
};

export const loadRounds = async (caselist, school, team, side) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams/${team}/rounds?side=${side}`);
};

export const addRound = async (caselist, school, team, round) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams/${team}/rounds`, { method: 'POST' }, round);
};

export const loadRound = async (caselist, school, team, round) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams/${team}/rounds/${round}`);
};

export const updateRound = async (caselist, school, team, round, body) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams/rounds/${body}`, { method: 'PUT' }, body);
};

export const deleteRound = async (caselist, school, team, round) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams/${team}/rounds/${round}`, { method: 'DELETE' });
};

export const addCite = async (caselist, school, team, cite) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams/${team}/cites`, { method: 'POST' }, cite);
};

export const loadCites = async (caselist, school, team, side) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams/${team}/cites?side=${side}`);
};

export const deleteCite = async (caselist, school, team, cite) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams/${team}/cites/${cite}`, { method: 'DELETE' });
};

export const loadTabroomChapters = async () => {
    return fetchBase(`tabroom/chapters`);
};

export const loadTabroomTeams = async () => {
    return fetchBase(`tabroom/teams`);
};

export const loadTabroomStudents = async () => {
    return fetchBase(`tabroom/students`);
};

export const loadTabroomRounds = async (slug) => {
    return fetchBase(`tabroom/rounds?slug=${slug}`);
};

export const addTabroomTeamLink = async (link) => {
    return fetchBase(`tabroom/teams`, { method: 'POST' }, { link });
};

export const loadOpenEv = async (year) => {
    return fetchBase(`openev?year=${year}`);
};

export const downloadFile = async (path) => {
    return fetchBase(`download?path=${encodeURIComponent(path)}`, { raw: true, maxRetries: 0, headers: {} });
};
