import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { sortBy } from 'lodash';

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
                const schoolList = await loadSchools(caselist) || [];
                schoolList?.sort((a, b) => a.display_name?.localeCompare(b.display_name));
                setSchools(schoolList || []);
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
            let sortedTeams = await loadTeams(caselist, school);

            // Sort by name first
            sortedTeams = sortBy(sortedTeams, 'name');

            // Move All and Novices to start of array
            const novicesIndex = sortedTeams?.findIndex(t => t.name === 'Novices');
            if (novicesIndex > -1) { sortedTeams.unshift(sortedTeams.splice(novicesIndex, 1)[0]); }
            const allIndex = sortedTeams?.findIndex(t => t.name === 'All');
            if (allIndex > -1) { sortedTeams.unshift(sortedTeams.splice(allIndex, 1)[0]); }

            setTeams(sortedTeams);
        } catch (err) {
            setTeams([]);
            console.log(err);
        }
    }, []);

    const store = useMemo(() => ({
        caselistData,
        fetchCaselist,
        schools,
        fetchSchools,
        schoolData,
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
