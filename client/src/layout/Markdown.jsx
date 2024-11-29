import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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
				/* empty */
			}
		};
		loadMarkdown();
	}, [file]);

	return <ReactMarkdown>{text}</ReactMarkdown>;
};

Markdown.propTypes = {
	file: PropTypes.string.isRequired,
};

export default Markdown;
