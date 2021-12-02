import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../helpers/store';

const CaselistHome = () => {
    const { caselist } = useParams();
    const { caselist: caselistData, fetchCaselist } = useStore();
    useEffect(() => {
        if (!caselistData || caselist !== caselistData.slug) {
            fetchCaselist(caselist);
        }
    }, [caselist, caselistData, fetchCaselist]);

    return (
        <div className="home">
            <h1>openCaselist</h1>
            <h2>Current Caselist: {caselistData.name}</h2>
        </div>
    );
};

export default CaselistHome;
