import fetch from './fetch-retry';

export const fetchBase = (path, options = {}, body = {}) => {
    const base = `http://localhost:10010/v1/`;
    const fetchOptions = {
        method: options.method ? options.method : 'GET',
        body: JSON.stringify(body),
        maxRetries: 3,
        retryDelay: process.env.NODE_ENV === 'test' ? 10 : 100,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    };

    if (fetchOptions.method === 'GET') { delete fetchOptions.body; }

    return fetch(`${base}${path}`, fetchOptions).then(r => r.json());
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

export const loadTabroomRounds = async (slug) => {
    return fetchBase(`tabroom/rounds?slug=${slug}`);
};

export const addTabroomTeamLink = async (link) => {
    return fetchBase(`tabroom/teams`, { method: 'POST' }, { link });
};
