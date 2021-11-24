import React, { useEffect, useState } from 'react';
import './Footer.css';

const Footer = () => {
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

    const Emoji = () => {
        return <span className={emojis[0] !== '♥' ? 'spinner' : ''}>{emojis[0]}</span>;
    };

    return (
        <footer className="footer">
            <span>
                <span>Created with </span>
                <Emoji />
                <span> by Ashtar Communications</span>
                <span className="bullet"> • </span>
                <span className="donate"><a href="https://paperlessdebate.com/donate">Donate</a></span>
            </span>
        </footer>
    );
};

export default Footer;
