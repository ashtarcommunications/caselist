import { useEffect } from 'react';
import PropTypes from 'prop-types';

const ScrollToTop = ({ history }) => {
    useEffect(() => {
        const unlisten = history.listen(() => {
            window.scrollTo(0, 0);
        });
        return () => {
            unlisten();
        };
    }, [history]);

    return (null);
};

ScrollToTop.propTypes = {
    history: PropTypes.object,
};

export default ScrollToTop;
