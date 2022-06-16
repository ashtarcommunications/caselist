import React, { createContext, useContext } from 'react';
import { startOfYear } from '@speechanddebate/nsda-js-utils';

export const StoreContext = createContext();

export const store = {
    fetchCaselist: jest.fn().mockResolvedValue({}),
    caselistData: { caselist_id: 1, year: startOfYear, name: 'testcaselist', display_name: 'Test Caselist', event: 'cx', level: 'hs', team_size: 2 },
    fetchSchools: jest.fn().mockResolvedValue([]),
    schools: [{ school_id: 1, name: 'testschool', display_name: 'Test School', state: 'CO' }],
    fetchSchool: jest.fn().mockResolvedValue({}),
    schoolData: { school_id: 1, name: 'testschool', display_name: 'Test School', state: 'CO' },
    fetchTeams: jest.fn().mockResolvedValue([{ team_id: 1, name: 'testteam', display_name: 'Test Team', debater1_first: 'Aaron', debater1_last: 'Hardy' }]),
    teams: [{ team_id: 1, name: 'testteam', display_name: 'Test Team', debater1_first: 'Aaron', debater1_last: 'Hardy', debater2_first: 'Chris', debater2_last: 'Palmer' }],
    fetchOpenEvFiles: jest.fn().mockResolvedValue([{ openev_id: 1, name: 'Test.docx', path: '/test', year: startOfYear, camp: 'CNDI', tags: '{"da":true,"cp":true}' }]),
    openEvFiles: [{ openev_id: 1, name: 'Test.docx', path: '/test', year: startOfYear, camp: 'CNDI', tags: '{"da":true}' }],
};

export const ProvideStore = ({ children }) => {
    return (
        <StoreContext.Provider value={store}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => useContext(StoreContext);
