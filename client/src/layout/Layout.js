import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../helpers/auth';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import OpenEvSidebar from '../openev/OpenEvSidebar';

import styles from './Layout.module.css';

const Layout = ({ privateRoute, caselist = false, children }) => {
    const auth = useContext(AuthContext);

    const { pathname, hash, key } = useLocation();

    // Allow scrolling to anchor links even when async
    useEffect(() => {
        if (hash === '') {
            window.scrollTo(0, 0);
        } else {
            let retries = 0;
            const id = hash.replace('#', '');
            const scroll = () => {
                retries += 0;
                if (retries > 50) return;
                const element = document.getElementById(id);
                if (element) {
                    setTimeout(() => element.scrollIntoView(), 0);
                } else {
                    setTimeout(scroll, 100);
                }
            };
            scroll();
        }
    }, [pathname, hash, key]);

    return (
        <>
            <Header />
            <div className={styles.wrapper}>
                {
                    privateRoute
                    && auth.user?.loggedIn
                    && (caselist ? <OpenEvSidebar /> : <Sidebar />)
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
    caselist: PropTypes.bool,
    children: PropTypes.node,
};

export default Layout;
