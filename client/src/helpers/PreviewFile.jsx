import { useEffect, useState } from 'react';
import { useSearchParams } from 'wouter';
import * as mammoth from 'mammoth/mammoth.browser';
import DOMPurify from 'dompurify';
import DownloadFile from './DownloadFile';

import { downloadFile } from './api.js';

import styles from './PreviewFile.module.css';

const PreviewFile = () => {
	const [html, setHTML] = useState('Loading preview...');
	const [searchParams] = useSearchParams();
	const path = searchParams.get('path');
	const filename = path?.split('/').pop();

	useEffect(() => {
		const handleDownload = async () => {
			try {
				if (!path || !path.endsWith('.docx')) {
					setHTML('Error: Only .docx files can be previewed.');
					return;
				}

				const file = await downloadFile(path);
				if (!file) {
					return;
				}
				const arrayBuffer = await file.arrayBuffer();

				try {
					const result = await mammoth.convertToHtml(
						{ arrayBuffer },
						{
							convertImage: mammoth.images.imgElement(() => {
								return {
									// Transparent 1x1 gif
									src: `data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==`,
									alt: 'Image removed',
								};
							}),
						},
					);
					const clean = DOMPurify.sanitize(result.value, {
						USE_PROFILES: { html: true },
					});
					setHTML(clean);
				} catch (err) {
					setHTML(`Error previewing file: ${err.message}`);
				}
			} catch (err) {
				setHTML(`Error previewing file: ${err.message}`);
			}
		};
		handleDownload();
	}, [path]);

	if (!path) {
		return <div className={styles.preview}>No file specified</div>;
	}

	return (
		<>
			<div className={styles.title}>
				<p>Previewing {filename}</p>
				<DownloadFile path={path} text="Download" />
			</div>
			<p className={styles.note}>
				Previews do not include formatting, underlining, or highlighting.
				Download for the full file.
			</p>
			<div className={styles.preview}>
				{/* eslint-disable-next-line react/no-danger */}
				<div dangerouslySetInnerHTML={{ __html: html }} />
			</div>
		</>
	);
};

export default PreviewFile;
