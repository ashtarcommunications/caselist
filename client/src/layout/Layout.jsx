import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'wouter';
import { useAuth } from '../helpers/auth';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import OpenEvSidebar from '../openev/OpenEvSidebar';

import styles from './Layout.module.css';

const Layout = ({
	privateRoute,
	suppressSidebar = false,
	openev = false,
	children,
}) => {
	const auth = useAuth();

	return (
		<>
			<Header />
			<div className={styles.wrapper}>
				{privateRoute &&
					auth.user?.loggedIn &&
					!suppressSidebar &&
					(openev ? <OpenEvSidebar /> : <Sidebar />)}
				<div className={styles.main}>
					{
						// eslint-disable-next-line no-nested-ternary
						!privateRoute ? (
							children
						) : auth.user?.loggedIn ? (
							children
						) : (
							<Redirect to="/" />
						)
					}
				</div>
			</div>
			<Footer />
		</>
	);
};

Layout.propTypes = {
	privateRoute: PropTypes.bool,
	suppressSidebar: PropTypes.bool,
	openev: PropTypes.bool,
	children: PropTypes.node,
};

export default Layout;
