import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import UFO from './ufo.svg';
import styles from './Error.module.css';

const Error = ({ statusCode = null, message = '', is404 = false }) => {
    const location = useLocation();
    const navigate = useNavigate();
    if (is404) {
        statusCode = 404;
        message = "Sorry, either that page doesn't exist or has ascended to the Ashtar Command!";
    }

    return (
        <div className={styles.error}>
            <div className={styles.ufo}><img src={UFO} alt="UFO" /></div>
            <div>
                <h3>Error {statusCode || location?.state?.statusCode}</h3>
                <p className={styles.message}>{message || location?.state?.message}</p>
                <p>
                    <a href="#" onClick={() => navigate(-1)}>Back</a>
                    <span> | </span>
                    <Link to="/">Home</Link>
                </p>
            </div>
        </div>
    );
};

export default Error;
