import { debugLogger } from '../v1/helpers/logger';

export const setupMocks = () => {
    if (process.env.NODE_ENV === 'production') { return false; }

    debugLogger.info('Setting up mocks...');

    global.fetch = (url) => {
        let json = {};
        if (url.includes('chapters')) {
            json = [
                { id: 1, name: 'Lexington HS', state: 'MA' },
                { id: 2, name: 'NFA', state: 'NY' },
            ];
        }
        if (url.includes('rounds')) {
            json = [
                { id: 1, tournament: 'Lexington', round: '1', side: 'A', opponent: 'Evil Empire XX', judge: 'Hardy' },
                { id: 2, tournament: 'Lexington', round: '2', side: 'N', opponent: 'Evil Empire YY', judge: 'Palmer' },
            ];
        }
        if (url.includes('students')) {
            json = [
                { id: 1, first: 'Aaron', last: 'Hardy', name: 'Aaron Hardy' },
                { id: 2, first: 'Chris', last: 'Palmer', name: 'Chris Palmer' },
            ];
        }
        if (url.includes('teams')) {
            json = [
                { id: 1, name: 'Northwestern XX' },
            ];
        }

        const response = {
            json: () => json,
            status: () => 200,
        };

        return Promise.resolve(response);
    };
};

export default setupMocks;
