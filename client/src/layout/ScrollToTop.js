import { useEffect } from 'react';

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

export default ScrollToTop;
