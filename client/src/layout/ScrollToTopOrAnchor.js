/* istanbul ignore file */
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';

const ScrollToTopOrAnchor = () => {
	const [location] = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [location]);

	const [hash] = useHashLocation();

	// Allow scrolling to anchor links even when element is async
	useEffect(() => {
		if (hash === '') {
			window.scrollTo(0, 0);
		} else {
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
	}, [hash]);

	return null;
};

export default ScrollToTopOrAnchor;
