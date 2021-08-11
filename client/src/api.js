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

export const loadSchools = async (wiki) => {
    return fetchBase(`${wiki}/schools`);
};

export const addSchool = async (wiki, school) => {
    return fetchBase(`${wiki}/schools`, { method: 'POST' }, school);
};

export const loadTeams = async (wiki, school) => {
    return fetchBase(`${wiki}/schools/${school}/teams`);
};

export const addTeam = async (wiki, school, team) => {
    return fetchBase(`${wiki}/schools/${school}/teams`, { method: 'POST' }, team);
};

export const loadRounds = async (wiki, school, team, side) => {
    return fetchBase(`${wiki}/schools/${school}/teams/${team}/rounds?side=${side}`);
};

export const addRound = async (wiki, school, team, round) => {
    return fetchBase(`${wiki}/schools/${school}/teams/rounds`, { method: 'POST' }, round);
};
