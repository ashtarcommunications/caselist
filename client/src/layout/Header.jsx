import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import { useAuth } from '../helpers/auth';
import { useStore } from '../helpers/store';
import { useDeviceDetect } from '../helpers/mobile';

import SearchForm from '../search/SearchForm';

import styles from './Header.module.css';

const Header = () => {
    const auth = useAuth();
    const { caselistData } = useStore();
    const { caselist } = useParams();
    const location = useLocation();
    const { isMobile } = useDeviceDetect();

    const [className, setClassName] = useState();

    // Set the header background based on the event/level combo
    useEffect(() => {
        if (caselistData.event && caselistData.level) {
            setClassName(`header-${caselistData.level}-${caselistData.event}`);
        } else {
            setClassName('');
        }
    }, [caselistData.level, caselistData.event]);

    let message = 'You must be a real student, judge, or coach on Tabroom to post on the caselist. ';
    message += 'If you think this determination is in error, try waiting a few days and then log in again. ';
    message += 'Until then, your account is in read-only mode, so you can browse, but not post.';

    return (
        <header className={`${styles.header} ${styles[className]} ${isMobile ? styles.mobile : ''}`}>
            <h1><Link to="/">openCaselist</Link></h1>
            {
                auth.user?.loggedIn &&
                (caselist || location.pathname.includes('openev')) &&
                <SearchForm />
            }
            {
                auth.user?.loggedIn && !auth.user?.trusted &&
                <div className={`pure-menu-item ${styles.untrusted}`} title={message}>
                    <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        title={message}
                        className={styles.untrusted}
                        data-testid="untrusted"
                    />
                    <Link to="/faq">Account Untrusted</Link>
                </div>
            }
            <div className={`${styles.menu} pure-menu`}>
                <ul>
                    {
                        auth.user?.loggedIn
                        && <li className="pure-menu-item"><Link to="/logout">Logout</Link></li>
                    }
                </ul>
            </div>
        </header>
    );
};

export default Header;
