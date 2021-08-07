export default (url, opt) => {
    const options = {
        maxRetries: 3,
        retryDelay: process.env.NODE_ENV === 'test' ? 10 : 100,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        ...opt,
    };
    const maxRetries = options.maxRetries;
    const retryDelay = options.retryDelay;

    const fetchRetryOrDie = (resolve, reject) => {
        let retryCount = 0;
        let statusCode;
        let statusText;

        const doRequest = () => {
            fetch(url, options).then((response) => {
                statusCode = response.status;
                statusText = response.statusText;
                const statusStr = response.status.toString();

                // Don't retry if status code is 2xx or 404
                if (statusStr.indexOf('2') === 0) {
                    return resolve(response);
                }
                if (statusStr === '404') {
                    const err = new Error(statusText);
                    err.statusCode = statusCode;
                    return reject(err);
                }

                // Convert response body to JSON to get error message
                return response.json();
            })
            .then((body) => {
                if (body) {
                    const err = new Error(body.message || statusText);
                    err.statusCode = statusCode;
                    throw err;
                }
            })
            .catch((err) => {
                if (maxRetries !== 0 && retryCount < maxRetries) {
                    retryCount += 1;
                    setTimeout(doRequest, retryDelay);
                } else {
                    reject(err);
                }
            });
        };
        doRequest();
    };

    return new Promise(fetchRetryOrDie);
};
