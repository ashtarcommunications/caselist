import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';
import { startOfYear } from '@speechanddebate/nsda-js-utils';

import { loadSearch } from '../helpers/api';
import { useStore } from '../helpers/store';
import { useDeviceDetect } from '../helpers/mobile';

import SearchForm from './SearchForm';
import Loader from '../loader/Loader';
import DownloadFile from '../helpers/DownloadFile';

import styles from './SearchResults.module.css';

const SearchResults = () => {
    const { isMobile } = useDeviceDetect();
    const { caselistData } = useStore();
    const { caselist, year } = useParams();
    const [params] = useSearchParams();
    const location = useLocation();

    const [fetching, setFetching] = useState(false);
    const [results, setResults] = useState([]);

    useEffect(() => {
        const q = params.get('q');

        let shard;
        if (caselist) {
            shard = caselist;
        } else if (year) {
            shard = `openev-${year}`;
        } else if (location.pathname?.includes('openev')) {
            shard = `openev-${startOfYear}`;
        }

        if (!q || !shard) { return false; }

        const getSearch = async () => {
            try {
                setFetching(true);
                setResults(await loadSearch(q, shard));
                setFetching(false);
            } catch (err) {
                setFetching(false);
                setResults([]);
                toast.error(err.message);
                console.log(err);
            }
        };
        getSearch();
    }, [params, caselist, year, location]);

    if (fetching) { return <Loader />; }

    return (
        <div className={`${styles.results} ${isMobile && styles.mobile}`}>
            <h1>Search Results in {caselistData.display_name ? caselistData.display_name : `Open Evidence ${year}`}</h1>
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
                            <Link to={`/${r.path}`}>
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
                        <div className={styles.details}>
                            {/* From Material Design Icons https://materialdesignicons.com/ */}
                            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="24" height="24" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M20 16L14.5 21.5L13.08 20.09L16.17 17H10.5C6.91 17 4 14.09 4 10.5V4H6V10.5C6 13 8 15 10.5 15H16.17L13.09 11.91L14.5 10.5L20 16Z" />
                            </svg>
                            {r.type === 'team' && <span>Team: <Link to={`/${r.path}`}>{r.team_display_name}</Link></span>}
                            {r.type === 'cite' && <span>Cite: <Link to={`/${r.path}`}>{r.title}</Link></span>}
                            {
                                r.type === 'file' &&
                                <span>
                                    <span>File: </span>
                                    <DownloadFile path={r.download_path} text={r.title} />
                                </span>
                            }
                            {
                                r.snippet &&
                                <p
                                    className={styles.snippet}
                                    // eslint-disable-next-line react/no-danger
                                    dangerouslySetInnerHTML={
                                        { __html: DOMPurify.sanitize(r.snippet) }
                                    }
                                />
                            }
                        </div>
                    </div>
                ))
            }
        </div>
    );
};

export default SearchResults;
