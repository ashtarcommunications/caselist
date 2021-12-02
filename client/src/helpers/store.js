import React, { createContext, useState, useContext, useCallback } from 'react';
import { loadCaselist, loadSchools } from './api';

// Create a context for the store
export const StoreContext = createContext();

// Store Context provider
export const ProvideStore = ({ children }) => {
    const [caselistData, setCaselistData] = useState({});

    const fetchCaselist = useCallback(async (caselist) => {
        try {
            if (caselist) {
                const response = await loadCaselist(caselist);
                setCaselistData(response || {});
            }
        } catch (err) {
            setCaselistData({});
            console.log(err);
        }
    }, []);

    const [schools, setSchools] = useState([]);

    const fetchSchools = useCallback(async (caselist) => {
        try {
            if (caselist) {
                const schoolData = await loadSchools(caselist);
                schoolData.sort((a, b) => a.name?.localeCompare(b.name));
                setSchools(schoolData || []);
            }
        } catch (err) {
            console.log(err);
            setSchools([]);
        }
    }, []);

    const store = {
        caselist: caselistData,
        fetchCaselist,
        schools,
        fetchSchools,
    };

    return (
        <StoreContext.Provider value={store}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => useContext(StoreContext);
