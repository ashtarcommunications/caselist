import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { loadSearch } from '../helpers/api';

import SearchForm from './SearchForm';
import Loader from '../loader/Loader';
import DownloadFile from '../helpers/DownloadFile';

import styles from './SearchResults.module.css';

const SearchResults = () => {
    const [params] = useSearchParams();

    const [fetching, setFetching] = useState(false);
    const [results, setResults] = useState([]);

    useEffect(() => {
        const q = params.get('q');
        const shard = params.get('shard');
        if (!q) { return false; }
        const getSearch = async () => {
            try {
                setFetching(true);
                setResults(await loadSearch(q, shard));
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

            {results.length > 0 && <p>{results.length} results found</p>}
            {
                results.map(r => (
                    <div key={r.team_id || r.download_path || r.path}>
                        <h2>
                            <Link to={`${r.path}`}>
                                {
                                    r.shard?.includes('openev') ?
                                        <span>
                                            Open Evidence {r.year}
                                        </span>
                                    :
                                        <span>
                                            {r.caselist_display_name} - {r.team_display_name}
                                        </span>
                                }
                            </Link>
                        </h2>
                        {r.type === 'cite' && <p>Cite: <Link to={`${r.path}`}>{r.title}</Link></p>}
                        {
                            r.type === 'file' &&
                            <p>
                                <span>File: </span>
                                <DownloadFile path={r.download_path} text={r.title} />
                            </p>
                        }
                        {r.snippet && <p className={styles.snippet}>{r.snippet}</p>}
                    </div>
                ))
            }
        </div>
    );
};

export default SearchResults;
