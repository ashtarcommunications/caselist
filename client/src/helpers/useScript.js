/* istanbul ignore file */
import { useEffect } from 'react';

const useScript = (url, data = {}) => {
    useEffect(() => {
        if (import.meta.env.NODE_ENV !== 'production' || !url) { return false; }

        const script = document.createElement('script');

        script.src = url;
        script.async = true;
        script.defer = true;

        Object.keys(data).forEach((d) => {
            script.dataset[d] = data[d];
        });

        document.querySelector('head').appendChild(script);

        return () => {
            document.querySelector('head').removeChild(script);
        };
    }, [url, data]);
};

export default useScript;
