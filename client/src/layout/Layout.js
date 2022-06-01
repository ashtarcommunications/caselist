import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../helpers/auth';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import OpenEvSidebar from '../openev/OpenEvSidebar';

import styles from './Layout.module.css';

const Layout = ({ privateRoute, openev = false, children }) => {
    const auth = useContext(AuthContext);

    return (
        <>
            <Header />
            <div className={styles.wrapper}>
                {
                    privateRoute
                    && auth.user?.loggedIn
                    && (openev ? <OpenEvSidebar /> : <Sidebar />)
                }
                <div className={styles.main}>
                    {
                        // eslint-disable-next-line no-nested-ternary
                        !privateRoute ? children :
                            auth.user?.loggedIn
                            ? children
                            : <Navigate to="/" />
                    }
                </div>
            </div>
            <Footer />
        </>
    );
};

Layout.propTypes = {
    privateRoute: PropTypes.bool,
    openev: PropTypes.bool,
    children: PropTypes.node,
};

export default Layout;
