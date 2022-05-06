import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const Markdown = ({ file }) => {
    const [text, setText] = useState(null);

    useEffect(() => {
        const loadMarkdown = async () => {
            try {
                const response = await fetch(file);
                const textContent = await response.text();
                setText(textContent);
            } catch (err) {
                console.log(err);
            }
        };
        loadMarkdown();
    }, [file]);

    return (
        <ReactMarkdown>{text}</ReactMarkdown>
    );
};

export default Markdown;
