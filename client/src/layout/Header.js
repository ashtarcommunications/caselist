import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../helpers/auth';
import { useStore } from '../helpers/store';
import './Header.css';

const Header = () => {
    const auth = useContext(AuthContext);
    const { caselist } = useStore();

    // TODO - doesn't work, there's no "type" for a caselist to map to a color
    // and need an !important
    const className = `header ${caselist.event}`;

    return (
        <header className={className}>
            <h1><Link to="/">openCaselist</Link></h1>
            <form className="pure-form search">
                <input type="text" placeholder="Search" />
            </form>
            <div className="menu pure-menu">
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
