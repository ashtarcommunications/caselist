import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './auth';
import CaselistDropdown from './CaselistDropdown';
import './Header.css';

function Header() {
    const auth = useAuth();
    return (
        <header className="header">
            <h1><Link to="/">openCaselist</Link></h1>
            <CaselistDropdown />
            <div className="menu pure-menu">
                <ul>
                    {
                    auth && auth.user?.loggedIn
                        ? <li className="pure-menu-item"><Link to="/logout">Logout</Link></li>
                        : <li className="pure-menu-item"><Link to="/login">Login</Link></li>
                    }
                </ul>
            </div>
        </header>
    );
}

export default Header;
