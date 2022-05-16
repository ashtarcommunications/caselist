import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { AuthContext } from '../helpers/auth';
import { useStore } from '../helpers/store';
import { useDeviceDetect } from '../helpers/mobile';

import SearchForm from '../search/SearchForm';

import styles from './Header.module.css';

const Header = () => {
    const auth = useContext(AuthContext);
    const { caselistData } = useStore();
    const { isMobile } = useDeviceDetect();

    // Set the header background based on the event/level combo
    const className = `header-${caselistData.level}-${caselistData.event}`;

    return (
        <header className={`${styles.header} ${styles[className]} ${isMobile && styles.mobile}`}>
            <h1><Link to="/">openCaselist</Link></h1>
            {
                auth.user?.loggedIn &&
                <SearchForm />
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
