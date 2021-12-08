import React from 'react';

import UFO from './ufo.svg';

const Error = ({ statusCode = null, message = '', is404 = false }) => {
    if (is404) {
        statusCode = 404;
        message = "Looks like that page doesn't exist!";
    }

    return (
        <div className="error">
            <div className="flex">
                <div className="logo">
                    <div><img src={UFO} alt="UFO" /></div>
                </div>
                <div className="message">
                    <h3>Error {statusCode}</h3>
                    <p>{message}</p>
                    <p><a href="/">Home</a></p>
                </div>
            </div>
        </div>
    );
};

export default Error;
