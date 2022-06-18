import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { startOfYear } from '@speechanddebate/nsda-js-utils';

import { useDeviceDetect } from '../helpers/mobile';

import styles from './SearchForm.module.css';

const SearchForm = () => {
    const { isMobile } = useDeviceDetect();
    const [params] = useSearchParams();
    const { caselist, year } = useParams();
    const location = useLocation();

    const [q, setQ] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setQ(params.get('q') || '');
    }, [params, caselist, year, location]);

    const handleChangeInput = (e) => {
        setQ(e.target.value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!q) { return false; }
        let url;
        if (caselist) {
            url = `/${caselist}/search?q=${q}`;
        } else if (year) {
            url = `/openev/${year}/search?q=${q}`;
        } else if (location.pathname.includes('openev')) {
            url = `/openev/${startOfYear}/search?q=${q}`;
        }
        if (!url) { return false; }
        navigate(url);
        setQ('');
    };

    return (
        <form onSubmit={handleSearch} className={`pure-form ${styles.search} ${isMobile && styles.mobile}`}>
            <input type="search" value={q} placeholder="Search" onChange={handleChangeInput} required minLength={3} pattern="[a-zA-Z0-9 -]+" />
            <button className={`pure-button ${styles.submit}`} type="submit" disabled={!q || q?.length < 3}>
                <FontAwesomeIcon icon={faSearch} />
            </button>
        </form>
    );
};

export default SearchForm;
