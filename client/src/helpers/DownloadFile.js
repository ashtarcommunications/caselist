import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

import { downloadFile } from './api';

import styles from './DownloadFile.module.css';

const DownloadFile = ({ path = '', text = '' }) => {
    const handleDownload = async () => {
        try {
            const file = await downloadFile(path);
            if (!file) { return false; }
            const content = await file.blob();
            // Handle weird UTF-8 encoding https://stackoverflow.com/questions/40939380/how-to-get-file-name-from-content-disposition
            let filename = file.headers?.get('Content-Disposition')?.split('filename=')[1].split(';')[0];
            filename = filename.replaceAll('"', '').trim();

            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(content);
            link.download = `${filename}`;
            link.click();
        } catch (err) {
            console.log(err);
            toast.error(err.message);
        }
    };

    return (
        <span onClick={handleDownload}>
            {
                text &&
                <span className={styles.link}>{text}</span>
            }
            <FontAwesomeIcon
                className={styles.download}
                icon={faFileDownload}
                title="Download"
            />
        </span>
    );
};

DownloadFile.propTypes = {
    path: PropTypes.string.isRequired,
    text: PropTypes.string,
};

export default DownloadFile;
