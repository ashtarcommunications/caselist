/* istanbul ignore file */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const ScrollToTopOrAnchor = ({ history }) => {
    useEffect(() => {
        const unlisten = history.listen(() => {
            window.scrollTo(0, 0);
        });
        return () => {
            unlisten();
        };
    }, [history]);

    const { pathname, hash, key } = useLocation();

    // Allow scrolling to anchor links even when element is async
    useEffect(() => {
        if (hash === '') {
            window.scrollTo(0, 0);
        } else {
            console.log('in hash');
            let retries = 0;
            const id = hash.replace('#', '');
            const scroll = () => {
                retries += 0;
                if (retries > 50) return;
                const element = document.getElementById(id);
                if (element) {
                    setTimeout(() => element.scrollIntoView(), 0);
                } else {
                    setTimeout(scroll, 100);
                }
            };
            scroll();
        }
    }, [pathname, hash, key]);

    return (null);
};

ScrollToTopOrAnchor.propTypes = {
    history: PropTypes.object,
};

export default ScrollToTopOrAnchor;
