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
    const admin = Cookies.get('caselist_admin');
    if (token && !user?.loggedIn) { setUser({ loggedIn: true, token, admin }); }

    const handleLogin = async (username, password, remember) => {
        try {
            const response = await login(username, password, remember);
            setUser({ loggedIn: true, token: response.token, admin: response.admin });
            Cookies.set('caselist_token', response.token, { HttpOnly: false });
            Cookies.set('caselist_admin', response.admin, { HttpOnly: false });
            return true;
        } catch (err) {
            console.log(err);
            setUser({ loggedIn: false, token: null });
            throw err;
        }
    };

    const handleLogout = () => {
        try {
            Cookies.set('caselist_token', '', { HttpOnly: false });
            Cookies.remove('caselist_token');
            Cookies.remove('caselist_admin');
            setUser({ loggedIn: false, token: null });
        } catch (err) {
            console.log(err);
            setUser({ loggedIn: false, token: null });
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
