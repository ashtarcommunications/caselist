/* istanbul ignore file */
import React, { createContext, useState, useMemo, useContext } from 'react';
import Cookies from 'js-cookie';
import { login } from './api';

// Create a context for auth info
export const AuthContext = createContext();

// Auth Context provider
export const ProvideAuth = ({ children }) => {
    const [user, setUser] = useState(null);

    // Set any token from cookies
    const token = Cookies.get('caselist_token');
    const trusted = Cookies.get('caselist_trusted');
    const admin = Cookies.get('caselist_admin');
    if (token && !user?.loggedIn) { setUser({ loggedIn: true, token, trusted, admin }); }

    const handleLogin = async (username, password, remember) => {
        try {
            const response = await login(username, password, remember);
            setUser({
                loggedIn: true,
                token: response.token,
                trusted: response.trusted,
                admin: response.admin,
            });
            return true;
        } catch (err) {
            console.log(err);
            setUser({ loggedIn: false, token: null, trusted: null, admin: null });
            throw err;
        }
    };

    const handleLogout = () => {
        try {
            // Remove dev and production cookies
            Cookies.remove('caselist_token');
            Cookies.remove('caselist_token', { path: '/', domain: '.opencaselist.com' });
            Cookies.remove('caselist_trusted');
            Cookies.remove('caselist_trusted', { path: '/', domain: '.opencaselist.com' });
            Cookies.remove('caselist_admin');
            Cookies.remove('caselist_admin', { path: '/', domain: '.opencaselist.com' });
            setUser({ loggedIn: false, token: null, trusted: null, admin: null });
        } catch (err) {
            console.log(err);
            setUser({ loggedIn: false, token: null, trusted: null, admin: null });
        }
    };

    const auth = useMemo(() => ({
        user,
        handleLogin,
        handleLogout,
    }), [user]);

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
