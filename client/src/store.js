import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { loadCaselist, loadSchools } from './api';

// Hook to track store state
export const useStore = () => {
    const [caselistData, setCaselistData] = useState({});

    const { caselist } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (caselist) {
                    const response = await loadCaselist(caselist);
                    setCaselistData(response || {});
                }
            } catch (err) {
                setCaselistData({});
                console.log(err);
            }
        };
        fetchData();
    }, [caselist]);

    const [schools, setSchools] = useState([]);

    const fetchSchools = useCallback(async () => {
        try {
            const schoolData = await loadSchools(caselist);
            schoolData.sort((a, b) => a.name?.localeCompare(b.name));
            setSchools(schoolData || []);
        } catch (err) {
            console.log(err);
            setSchools([]);
        }
    }, [caselist]);

    useEffect(() => {
        fetchSchools();
    }, [caselist, fetchSchools]);

    return {
        caselist: caselistData,
        schools,
        fetchSchools,
    };
};

// Create a context for the store
export const StoreContext = createContext();

// Store Context provider
export const ProvideStore = ({ children }) => {
    const store = useStore();
    return (
        <StoreContext.Provider value={store}>
            {children}
        </StoreContext.Provider>
    );
};
