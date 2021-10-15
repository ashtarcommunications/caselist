import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './auth';
import CaselistDropdown from './CaselistDropdown';
import './Header.css';

const Header = () => {
    const auth = useContext(AuthContext);
    return (
        <header className="header">
            <h1><Link to="/">openCaselist</Link></h1>
            {auth.user?.loggedIn && <CaselistDropdown />}
            <div className="menu pure-menu">
                <ul>
                    {
                    auth.user?.loggedIn
                        ? <li className="pure-menu-item"><Link to="/logout">Logout</Link></li>
                        : <li className="pure-menu-item"><Link to="/login">Login</Link></li>
                    }
                </ul>
            </div>
        </header>
    );
};

export default Header;
