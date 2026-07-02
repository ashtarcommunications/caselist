/* istanbul ignore file */
import React, { createContext, useState, useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import { login } from './api.js';

// Create a context for auth info
export const AuthContext = createContext();

// Auth Context provider
export const ProvideAuth = ({ children }) => {
	const [user, setUser] = useState(null);

	// Set any token from cookies
	const token = Cookies.get('caselist_token');
	const trusted = Cookies.get('caselist_trusted');
	const admin = Cookies.get('caselist_admin');
	const userId = Cookies.get('caselist_user_id');
	if (token && !user?.loggedIn) {
		setUser({ loggedIn: true, token, trusted, admin, userId });
	}

	const handleLogin = async (username, password, remember) => {
		try {
			const response = await login(username, password, remember);
			setUser({
				loggedIn: true,
				token: response.token,
				trusted: response.trusted,
				admin: response.admin,
				userId: response.userId,
			});
			return true;
		} catch (err) {
			setUser({
				loggedIn: false,
				token: null,
				trusted: null,
				admin: null,
				userId: null,
			});
			throw err;
		}
	};

	const handleLogout = () => {
		try {
			// Remove dev and production cookies
			Cookies.remove('caselist_token');
			Cookies.remove('caselist_token', {
				path: '/',
				domain: '.opencaselist.com',
			});
			Cookies.remove('caselist_trusted');
			Cookies.remove('caselist_trusted', {
				path: '/',
				domain: '.opencaselist.com',
			});
			Cookies.remove('caselist_admin');
			Cookies.remove('caselist_admin', {
				path: '/',
				domain: '.opencaselist.com',
			});
			Cookies.remove('caselist_user_id');
			Cookies.remove('caselist_user_id', {
				path: '/',
				domain: '.opencaselist.com',
			});
			setUser({
				loggedIn: false,
				token: null,
				trusted: null,
				admin: null,
				userId: null,
			});
		} catch (err) {
			setUser({
				loggedIn: false,
				token: null,
				trusted: null,
				admin: null,
				userId: null,
			});
		}
	};

	const auth = useMemo(
		() => ({
			user,
			handleLogin,
			handleLogout,
		}),
		[user],
	);

	return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

ProvideAuth.propTypes = {
	children: PropTypes.node,
};

export const useAuth = () => useContext(AuthContext);

// Mock auth object for testing
export const auth = {};
