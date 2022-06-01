import React, { createContext, useContext } from 'react';

export const AuthContext = createContext();

export const auth = {
    user: { token: 'token', loggedIn: true, admin: true },
    handleLogin: jest.fn().mockResolvedValue(true),
    handleLogout: jest.fn().mockResolvedValue(true),
};

// Auth Context provider
export const ProvideAuth = ({ children }) => {
    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
