import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import styles from './Footer.module.css';

const Emoji = () => {
    const [emojis, setEmojis] = useState(['✨', '🔥', '❄️', '🌀', '🎶', '💯', '🦓', '♥']);
    useEffect(() => {
        if (emojis.length > 1) {
            setTimeout(() => {
                const newEmojis = [...emojis];
                newEmojis.shift();
                setEmojis(newEmojis);
            }, 1000);
        }
    }, [emojis]);
    return <span className={emojis[0] !== '♥' ? styles.spinner : undefined}>{emojis[0]}</span>;
};

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <span>
                <span>Created with </span>
                <Emoji />
                <span> by <a href="https://paperlessdebate.com" rel="noopener noreferrer" target="_blank">Ashtar</a></span>
                <span className={styles.divider}> | </span>
                <span><a href="https://paperlessdebate.com/donate" rel="noopener noreferrer" target="_blank">Donate</a></span>
                <span className={styles.divider}> | </span>
                <Link to="/privacy">Privacy Policy</Link>
                <span className={styles.divider}> | </span>
                <Link to="/terms">Terms</Link>
                <span className={styles.divider}> | </span>
                <a href="https://paperlessdebate.com/#contact" rel="noopener noreferrer" target="_blank">Contact</a>
            </span>
        </footer>
    );
};

export default Footer;
