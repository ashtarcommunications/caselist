import React from 'react';

import UFO from './ufo.svg';
import styles from './Error.module.css';

const Error = ({ statusCode = null, message = '', is404 = false }) => {
    if (is404) {
        statusCode = 404;
        message = "Sorry, either that page doesn't exist or has ascended to the Ashtar Command!";
    }

    return (
        <div className={styles['error-container']}>
            <div className={styles.ufo}><img src={UFO} alt="UFO" /></div>
            <div className={styles['error-message']}>
                <h3>Error {statusCode}</h3>
                <p>{message}</p>
                <p><a href="/">Home</a></p>
            </div>
        </div>
    );
};

export default Error;
