import React, { createContext, useContext } from 'react';
import { startOfYear } from '@speechanddebate/nsda-js-utils';

export const StoreContext = createContext();

export const store = {
    fetchCaselist: jest.fn().mockResolvedValue({}),
    caselistData: { caselist_id: 1, year: startOfYear, name: 'testcaselist', display_name: 'Test Caselist', event: 'cx', level: 'hs' },
    fetchSchools: jest.fn().mockResolvedValue([]),
    schools: [{ school_id: 1, name: 'testschool', display_name: 'Test School', state: 'CO' }],
    fetchSchool: jest.fn().mockResolvedValue({}),
    schoolData: { school_id: 1, name: 'testschool', display_name: 'Test School', state: 'CO' },
    fetchTeams: jest.fn().mockResolvedValue({}),
    teams: [],
    fetchOpenEvFiles: jest.fn().mockResolvedValue([]),
    openEvFiles: [],
};

export const ProvideStore = ({ children }) => {
    return (
        <StoreContext.Provider value={store}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => useContext(StoreContext);
