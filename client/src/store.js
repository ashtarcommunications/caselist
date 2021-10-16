import React, { createContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { loadCaselist } from './api';

// Hook to track store state
export const useStore = () => {
    console.log('running store');
    const [caselistData, setCaselistData] = useState({});

    const { caselist } = useParams();
    console.log(caselist);

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

    return {
        caselist: caselistData,
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
