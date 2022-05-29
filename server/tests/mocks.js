import { debugLogger } from '../v1/helpers/logger';

export const setupMocks = () => {
    if (process.env.NODE_ENV === 'production') { return false; }

    debugLogger.info('Setting up mocks...');

    global.fetch = (url) => {
        let json = [];

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

        if (url.includes('solr')) {
            json = {
                responseHeader: {},
                response: { docs: [
                    {
                        type: ['file'],
                        id: '/ndtceda21/Northwestern/HaPa/test.docx',
                        shard: ['ndtceda21'],
                        caselist: ['ndtceda21'],
                        caselist_display_name: ['NDT/CEDA 2021'],
                        school: ['Northwestern'],
                        team: ['HaPa'],
                        team_display_name: ['Northwestern HaPa'],
                        year: ['2021'],
                        path: ['/ndtceda21/Northwestern/HaPa/test.docx'],
                    },
                    {
                        type: ['cite'],
                        id: '/ndtceda21/Northwestern/HaPa#1',
                        cite_id: 1,
                        title: ['Cite Title'],
                        shard: ['ndtceda21'],
                        caselist: ['ndtceda21'],
                        caselist_display_name: ['NDT/CEDA 2021'],
                        school: ['Northwestern'],
                        team: ['HaPa'],
                        team_display_name: ['Northwestern HaPa'],
                        path: ['/ndtceda21/Northwestern/HaPa#1'],
                    },
                ] },
                highlighting: {
                    '/ndtceda21/Northwestern/HaPa/test.docx': { content: ['File contents'] },
                    '/ndtceda21/Northwestern/HaPa#1': { content: ['Cite contents'] },
                },
            };
        }

        const response = {
            json: () => json,
            text: () => JSON.stringify(json),
            status: 200,
            statusText: 'Success',
        };

        return Promise.resolve(response);
    };
};

export default setupMocks;
