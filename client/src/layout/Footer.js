import React, { useEffect, useState } from 'react';
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
                <span> by <a href="https://paperlessdebate.com">Ashtar</a></span>
                <span className={styles.bullet}> • </span>
                <span className={styles.donate}><a href="https://paperlessdebate.com/donate">Donate</a></span>
            </span>
        </footer>
    );
};

export default Footer;
