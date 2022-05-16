import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { loadSearch } from '../helpers/api';

import SearchForm from './SearchForm';
import Loader from '../loader/Loader';

import styles from './SearchResults.module.css';

const SearchResults = () => {
    const [params] = useSearchParams();

    const [fetching, setFetching] = useState(false);
    const [results, setResults] = useState([]);

    useEffect(() => {
        const q = params.get('q');
        if (!q) { return false; }
        const getSearch = async () => {
            try {
                setFetching(true);
                setResults(await loadSearch(q));
                setFetching(false);
            } catch (err) {
                setFetching(false);
                setResults([]);
                console.log(err);
            }
        };
        getSearch();
    }, [params]);

    if (fetching) { return <Loader />; }

    return (
        <div className={styles.results}>
            <h1>Search Results</h1>
            <SearchForm />
            {
                (!results || results.length < 1) &&
                <p>No results found.</p>
            }
            <p>{JSON.stringify(results)}</p>
        </div>
    );
};

export default SearchResults;
