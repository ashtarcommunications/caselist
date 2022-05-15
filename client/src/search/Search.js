import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { loadSearch } from '../helpers/api';

// import styles from './CaselistHome.module.css';

const Search = () => {
    const [params] = useSearchParams();
    const [results, setResults] = useState([]);
    useEffect(() => {
        const q = params.get('q');
        if (!q) { return false; }
        const getSearch = async () => {
            setResults(await loadSearch(q));
        };
        getSearch();
    }, [params]);

    return (
        <div>
            <h1>Search Results</h1>
            <h2>Query: {params.get('q')}</h2>
            <p>{JSON.stringify(results)}</p>
        </div>
    );
};

export default Search;
