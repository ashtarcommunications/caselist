import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';

import { downloadFile } from './api';

import styles from './DownloadFile.module.css';

const DownloadFile = ({ path = '' }) => {
    const handleDownload = async () => {
        try {
            const file = await downloadFile(path);
            if (!file) { return false; }
            const content = await file.blob();
            const filename = file.headers.get('Content-Disposition').match(/filename="(.*?)"$/)[1];

            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(content);
            link.download = `${filename}`;
            link.click();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <FontAwesomeIcon
            className={styles.download}
            icon={faFileDownload}
            title="Download"
            onClick={handleDownload}
        />
    );
};

DownloadFile.propTypes = {
    path: PropTypes.string.isRequired,
};

export default DownloadFile;
