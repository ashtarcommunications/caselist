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

export const loadSchools = async (caselist) => {
    return fetchBase(`${caselist}/schools`);
};

export const loadSchool = async (caselist, school) => {
    return fetchBase(`${caselist}/schools/${school}`);
};

export const addSchool = async (caselist, school) => {
    return fetchBase(`${caselist}/schools`, { method: 'POST' }, school);
};

export const loadTeams = async (caselist, school) => {
    return fetchBase(`${caselist}/schools/${school}/teams`);
};

export const addTeam = async (caselist, school, team) => {
    return fetchBase(`${caselist}/schools/${school}/teams`, { method: 'POST' }, team);
};

export const loadRounds = async (caselist, school, team, side) => {
    return fetchBase(`${caselist}/schools/${school}/teams/${team}/rounds?side=${side}`);
};

export const addRound = async (caselist, school, team, round) => {
    return fetchBase(`${caselist}/schools/${school}/teams/rounds`, { method: 'POST' }, round);
};
