import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { loadCaselist } from './api';

const Home = () => {
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

    return (
        <div className="home">
            <h1>openCaselist</h1>
            <h2>Current Caselist: {JSON.stringify(caselistData)}</h2>
        </div>
    );
};

export default Home;
