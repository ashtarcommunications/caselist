import React from 'react';
import PropTypes from 'prop-types';
import history from 'history/browser';
import { Link, useLocation } from 'wouter';

import UFO from './ufo.svg';
import styles from './Error.module.css';

const useLocationWithGoBack = () => {
	const [location, setLocation] = useLocation();
	const goBack = () => {
		history.go(-1);
	};

	return [location, setLocation, goBack];
};

const Error = ({ statusCode = null, message = '', is404 = false }) => {
	const [, , goBack] = useLocationWithGoBack();
	let displayStatusCode = statusCode;
	let displayMessage = message;

	if (is404 || statusCode === 404) {
		displayStatusCode = 404;
		displayMessage =
			"Sorry, either that page doesn't exist or has ascended to the Ashtar Command!";
	}

	return (
		<div className={styles.error}>
			<div className={styles.ufo}>
				<img src={UFO} alt="UFO" />
			</div>
			<div>
				<h3>Error {displayStatusCode}</h3>
				<p className={styles.message}>{displayMessage}</p>
				<p>
					{/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
					<a href="#" onClick={() => goBack()}>
						Back
					</a>
					<span> | </span>
					<Link to="/">Home</Link>
				</p>
			</div>
		</div>
	);
};

Error.propTypes = {
	statusCode: PropTypes.number,
	message: PropTypes.string,
	is404: PropTypes.bool,
};

export default Error;
