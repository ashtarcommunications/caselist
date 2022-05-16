import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

import { useDeviceDetect } from '../helpers/mobile';

import styles from './SearchForm.module.css';

const SearchForm = () => {
    const { isMobile } = useDeviceDetect();
    const [params] = useSearchParams();

    const [q, setQ] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setQ(params.get('q'));
    }, [params]);

    const handleChangeInput = (e) => {
        setQ(e.currentTarget.value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/search?q=${q}`);
    };

    return (
        <form onSubmit={handleSearch} className={`pure-form ${styles.search} ${isMobile && styles.mobile}`}>
            <input type="text" value={q} placeholder="Search" onChange={handleChangeInput} />
            <button className={`pure-button ${styles.submit}`} type="submit">
                <FontAwesomeIcon icon={faSearch} />
            </button>
        </form>
    );
};

export default SearchForm;
