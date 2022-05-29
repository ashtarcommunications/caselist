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
    const [shard, setShard] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setQ(params.get('q') || '');
        setShard(params.get('shard') || location.pathname?.includes('openev') ? `openev-${year || startOfYear}` : caselist || '');
    }, [params, caselist, year, location]);

    const handleChangeInput = (e) => {
        setQ(e.currentTarget.value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!q) { return false; }
        navigate(`/search?q=${q}&shard=${shard}`);
        setQ('');
    };

    return (
        <form onSubmit={handleSearch} className={`pure-form ${styles.search} ${isMobile && styles.mobile}`}>
            <input type="text" value={q} placeholder="Search" onChange={handleChangeInput} required minLength={3} />
            <button className={`pure-button ${styles.submit}`} type="submit" disabled={!q || q?.length < 3}>
                <FontAwesomeIcon icon={faSearch} />
            </button>
        </form>
    );
};

export default SearchForm;
