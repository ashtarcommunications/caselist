import React, { useContext, createContext, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import Cookies from 'js-cookie';
import { login } from './api';

// Hook to track user state and log in or out
export const useProvideAuth = () => {
    const [user, setUser] = useState(null);

    // Set any token from cookies
    const token = Cookies.get('caselist_token');
    if (token && !user?.loggedIn) { setUser({ loggedIn: true, token }); }

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

// Hook to access the auth context
export const useAuth = () => {
    return useContext(AuthContext);
};

// Auth Context provider
export const ProvideAuth = ({ children }) => {
    const auth = useProvideAuth();
    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};

// Private route - redirect to login without auth info
export const PrivateRoute = ({ children, ...rest }) => {
    // Get the auth info from context hook
    const auth = useAuth();
    return (
        <Route
            {...rest}
            render={
                ({ location }) => {
                    return auth.user && auth.user?.loggedIn
                        ? children
                        : <Redirect to={{ pathname: '/login', state: { from: location } }} />;
                }
            }
        />
    );
};
