import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { loadCaselist, loadSchools, loadSchool, loadTeams } from './api';

// Create a context for the store
export const StoreContext = createContext();

// Store Context provider
export const ProvideStore = ({ children }) => {
    const [caselistData, setCaselistData] = useState({});

    const fetchCaselist = useCallback(async (caselist) => {
        try {
            if (caselist) {
                setCaselistData(await loadCaselist(caselist) || {});
            }
        } catch (err) {
            console.log(err);
        }
    }, []);

    const [schools, setSchools] = useState([]);

    const fetchSchools = useCallback(async (caselist) => {
        try {
            if (caselist) {
                const schoolData = await loadSchools(caselist);
                schoolData.sort((a, b) => a.display_name?.localeCompare(b.display_name));
                setSchools(schoolData || []);
            }
        } catch (err) {
            setSchools([]);
            console.log(err);
        }
    }, []);

    const [schoolData, setSchoolData] = useState({});
    const fetchSchool = useCallback(async (caselist, school) => {
        try {
            setSchoolData(await loadSchool(caselist, school) || {});
        } catch (err) {
            console.log(err);
        }
    }, []);

    const [teams, setTeams] = useState([]);
    const fetchTeams = useCallback(async (caselist, school) => {
        try {
            setTeams(await loadTeams(caselist, school));
        } catch (err) {
            setTeams([]);
            console.log(err);
        }
    }, []);

    const store = useMemo(() => ({
        caselist: caselistData,
        fetchCaselist,
        schools,
        fetchSchools,
        school: schoolData,
        fetchSchool,
        teams,
        fetchTeams,
    }), [
        caselistData,
        fetchCaselist,
        fetchSchool,
        fetchSchools,
        fetchTeams,
        schoolData,
        schools,
        teams,
    ]);

    return (
        <StoreContext.Provider value={store}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => useContext(StoreContext);
