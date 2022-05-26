import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { sortBy } from 'lodash';
import { startOfYear } from '@speechanddebate/nsda-js-utils';

import { loadCaselist, loadSchools, loadSchool, loadTeams, loadOpenEvFiles } from './api';

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
            setCaselistData(err);
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
            console.log(err);
            setSchools(err);
        }
    }, []);

    const [schoolData, setSchoolData] = useState({});
    const fetchSchool = useCallback(async (caselist, school) => {
        try {
            setSchoolData(await loadSchool(caselist, school) || {});
        } catch (err) {
            console.log(err);
            setSchoolData(err);
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
            console.log(err);
            setTeams([]);
        }
    }, []);

    const [openEvFiles, setOpenEvFiles] = useState([]);
    const fetchOpenEvFiles = useCallback(async (year) => {
        try {
            let files = await loadOpenEvFiles(year || startOfYear);
            files = sortBy(files, 'name');
            setOpenEvFiles(files);
        } catch (err) {
            console.log(err);
            setOpenEvFiles([]);
        }
    }, []);

    const store = useMemo(() => ({
        fetchCaselist,
        caselistData,
        fetchSchools,
        schools,
        fetchSchool,
        schoolData,
        fetchTeams,
        teams,
        fetchOpenEvFiles,
        openEvFiles,
    }), [
        caselistData,
        fetchCaselist,
        fetchSchools,
        schools,
        fetchSchool,
        schoolData,
        fetchTeams,
        teams,
        fetchOpenEvFiles,
        openEvFiles,
    ]);

    return (
        <StoreContext.Provider value={store}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => useContext(StoreContext);
