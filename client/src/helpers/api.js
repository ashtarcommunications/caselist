/* istanbul ignore file */
import { createBrowserHistory } from 'history';
import { fetch } from '@speechanddebate/nsda-js-utils';

/* Hacky HistoryRouter kludge for react-router v6 */
/* https://github.com/remix-run/react-router/issues/8264 */
export const history = createBrowserHistory();

export const fetchBase = async (path, options = {}, body = {}) => {
    const base = import.meta.env.VITE_API_BASE;
    const fetchOptions = {
        method: options.method ? options.method : 'GET',
        body: body instanceof FormData ? body : JSON.stringify(body),
        maxRetries: (options.method && options.method !== 'GET') ? 0 : 3,
        retryDelay: import.meta.env.NODE_ENV === 'test' ? 10 : 100,
        credentials: 'include',
        headers: body instanceof FormData ? {} : {
            'Content-Type': 'application/json',
        },
        ...options,
    };

    if (fetchOptions.method === 'GET') {
        delete fetchOptions.body;
        delete fetchOptions.headers?.['Content-Type'];
    }

    try {
        const response = await fetch(`${base}/${path}`, fetchOptions);
        return options.raw ? response : response.json();
    } catch (err) {
        if (err.statusCode === 401) {
            history.push('/');
        }
        throw err;
    }
};

export const login = async (username, password, remember) => {
    return fetchBase(`login`, { method: 'POST' }, { username, password, remember });
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

export const loadDownloads = async (caselist) => {
    return fetchBase(`caselists/${caselist}/downloads`);
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

export const loadSchoolHistory = async (caselist, school) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/history`);
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

export const loadTeamHistory = async (caselist, school, team) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams/${team}/history`);
};

export const loadRounds = async (caselist, school, team, side) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams/${team}/rounds?side=${side || ''}`);
};

export const addRound = async (caselist, school, team, round) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams/${team}/rounds`, { method: 'POST' }, round);
};

export const loadRound = async (caselist, school, team, round) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams/${team}/rounds/${round}`);
};

export const updateRound = async (caselist, school, team, round, body) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams/${team}/rounds/${round}`, { method: 'PUT' }, body);
};

export const deleteRound = async (caselist, school, team, round) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams/${team}/rounds/${round}`, { method: 'DELETE' });
};

export const addCite = async (caselist, school, team, cite) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams/${team}/cites`, { method: 'POST' }, cite);
};

export const loadCites = async (caselist, school, team, side) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams/${team}/cites?side=${side || ''}`);
};

export const deleteCite = async (caselist, school, team, cite) => {
    return fetchBase(`caselists/${caselist}/schools/${school}/teams/${team}/cites/${cite}`, { method: 'DELETE' });
};

export const loadTabroomChapters = async () => {
    return fetchBase(`tabroom/chapters`);
};

export const loadTabroomRounds = async (slug) => {
    return fetchBase(`tabroom/rounds?slug=${slug}`);
};

export const loadTabroomStudents = async () => {
    return fetchBase(`tabroom/students`);
};

export const addTabroomLink = async (slug) => {
    return fetchBase(`tabroom/link`, { method: 'POST' }, { slug });
};

export const loadOpenEvFiles = async (year) => {
    return fetchBase(`openev?year=${year}`);
};

export const addOpenEvFile = async (file) => {
    return fetchBase(`openev`, { method: 'POST' }, file);
};

export const deleteOpenEvFile = async (id) => {
    return fetchBase(`openev/${id}`, { method: 'DELETE' });
};

export const downloadFile = async (path) => {
    return fetchBase(`download?path=${encodeURIComponent(path)}`, { raw: true, maxRetries: 0, headers: {} });
};

export const loadSearch = async (q, shard) => {
    return fetchBase(`search?q=${encodeURI(q)}&shard=${encodeURI(shard)}`, { maxRetries: 0 });
};
