import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import UFO from './ufo.svg';
import styles from './Error.module.css';

const Error = ({ statusCode = null, message = '', is404 = false }) => {
    const location = useLocation();
    if (is404) {
        statusCode = 404;
        message = "Sorry, either that page doesn't exist or has ascended to the Ashtar Command!";
    }

    return (
        <div className={styles['error-container']}>
            <div className={styles.ufo}><img src={UFO} alt="UFO" /></div>
            <div className={styles['error-message']}>
                <h3>Error {statusCode || location?.state?.statusCode}</h3>
                <p>{message || location?.state?.message}</p>
                <p><Link to="/">Home</Link></p>
            </div>
        </div>
    );
};

export default Error;
