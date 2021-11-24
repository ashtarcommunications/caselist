import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from './store';

const CaselistHome = () => {
    const { caselist } = useParams();
    const { caselist: caselistData, fetchCaselist } = useStore();
    useEffect(() => {
        fetchCaselist(caselist);
    }, [caselist, fetchCaselist]);

    return (
        <div className="home">
            <h1>openCaselist</h1>
            <h2>Current Caselist: {caselistData.name}</h2>
        </div>
    );
};

export default CaselistHome;
