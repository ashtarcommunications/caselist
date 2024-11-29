import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { vi } from 'vitest';

export const AuthContext = createContext();

export const auth = {
	user: { token: 'token', loggedIn: true, trusted: true, admin: true },
	handleLogin: vi.fn().mockResolvedValue(true),
	handleLogout: vi.fn().mockResolvedValue(true),
};

// Auth Context provider
export const ProvideAuth = ({ children }) => {
	return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

ProvideAuth.propTypes = {
	children: PropTypes.node,
};
