import React from 'react';
import { Link } from 'react-router-dom';

import { useDeviceDetect } from '../helpers/mobile';

import styles from './Footer.module.css';

const Footer = () => {
    const { isMobile } = useDeviceDetect();
    return (
        <footer className={`${styles.footer} ${isMobile && styles.mobile}`}>
            {/* From Material Design Icons https://materialdesignicons.com/ */}
            <div className={styles.ufo}>
                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M17 10.54C16.78 7.44 14.63 5 12 5S7.22 7.44 7 10.54C4 11.23 2 12.5 2 14C2 16.21 6.5 18 12 18S22 16.21 22 14C22 12.5 20 11.23 17 10.54M14.93 11.84C13.03 12.05 10.97 12.05 9.07 11.84C9.03 11.56 9 11.28 9 11C9 8.8 10.35 7 12 7S15 8.8 15 11C15 11.28 15 11.56 14.93 11.84Z" />
                </svg>
            </div>
            <span>
                <span><a href="https://paperlessdebate.com/donate" rel="noopener noreferrer" target="_blank">Donate</a></span>
                <span className={styles.divider}> | </span>
                <a href="https://paperlessdebate.com/#contact" rel="noopener noreferrer" target="_blank">Contact</a>
                <span className={styles.divider}> | </span>
                <a href="/faq">FAQ</a>
                <span className={styles.divider}> | </span>
                <span>Created by </span>
                <span><a href="https://paperlessdebate.com" rel="noopener noreferrer" target="_blank">Ashtar</a></span>
                <span className={styles.divider}> | </span>
                <Link to="/history">History</Link>
                <span className={styles.divider}> | </span>
                <Link to="/privacy">Privacy Policy</Link>
                <span className={styles.divider}> | </span>
                <Link to="/terms">Terms</Link>
            </span>
        </footer>
    );
};

export default Footer;
