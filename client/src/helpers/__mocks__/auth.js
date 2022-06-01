import React, { createContext } from 'react';

export const useAuth = () => {
    return {
        user: { token: 'token', loggedIn: true, admin: true },
        handleLogin: jest.fn().mockResolvedValue(true),
        handleLogout: jest.fn().mockResolvedValue(true),
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
