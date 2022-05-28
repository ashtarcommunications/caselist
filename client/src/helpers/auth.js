import React, { createContext, useState } from 'react';
import Cookies from 'js-cookie';
import { login } from './api';

// Hook to track user state and log in or out
export const useAuth = () => {
    const [user, setUser] = useState(null);

    // Set any token from cookies
    const token = Cookies.get('caselist_token');
    const admin = Cookies.get('caselist_admin');
    if (token && !user?.loggedIn) { setUser({ loggedIn: true, token, admin }); }

    const handleLogin = async (username, password) => {
        try {
            const response = await login(username, password);
            // Cookies.set('caselist_token', response.token);
            setUser({ loggedIn: true, token: response.token });
        } catch (err) {
            console.log(err);
            setUser({ loggedIn: false, token: null });
        }
    };

    const handleLogout = () => {
        try {
            Cookies.set('caselist_token', '', { HttpOnly: false });
            Cookies.remove('caselist_token');
            setUser({ loggedIn: false, token: null });
        } catch (err) {
            console.log(err);
            setUser({ loggedIn: false, token: null });
        }
    };

    return {
        user,
        handleLogin,
        handleLogout,
    };
};

// Create a context for auth info
export const AuthContext = createContext();

// Auth Context provider
export const ProvideAuth = ({ children }) => {
    const auth = useAuth();
    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};
