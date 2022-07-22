/* istanbul ignore file */
import React, { createContext, useState, useContext } from 'react';
import Cookies from 'js-cookie';
import { login } from './api';

// Create a context for auth info
export const AuthContext = createContext();

// Auth Context provider
export const ProvideAuth = ({ children }) => {
    const [user, setUser] = useState(null);

    // Set any token from cookies
    const token = Cookies.get('caselist_token');
    const admin = Cookies.get('caselist_admin');
    if (token && !user?.loggedIn) { setUser({ loggedIn: true, token, admin }); }

    const handleLogin = async (username, password, remember) => {
        try {
            const response = await login(username, password, remember);
            setUser({ loggedIn: true, token: response.token, admin: response.admin });
            return true;
        } catch (err) {
            console.log(err);
            setUser({ loggedIn: false, token: null });
            throw err;
        }
    };

    const handleLogout = () => {
        try {
            // Remove dev and production cookies
            Cookies.remove('caselist_token');
            Cookies.remove('caselist_token', { path: '/', domain: '.opencaselist.com' });
            Cookies.remove('caselist_admin');
            Cookies.remove('caselist_admin', { path: '/', domain: '.opencaselist.com' });
            setUser({ loggedIn: false, token: null });
        } catch (err) {
            console.log(err);
            setUser({ loggedIn: false, token: null });
        }
    };

    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const auth = {
        user,
        handleLogin,
        handleLogout,
    };

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
