import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import styles from './UploadedFiles.module.css';

const UploadedFiles = ({ files, filename, handleResetFiles, showFilename }) => {
    return (
        <div>
            {
                files.map(file => (
                    <React.Fragment key={file.path}>
                        <p>
                            <span>Uploaded file: </span>
                            {file.path}
                            <FontAwesomeIcon
                                className={styles.trash}
                                icon={faTrash}
                                onClick={handleResetFiles}
                            />
                        </p>
                        {
                            showFilename
                            && <p>File will be renamed: {`${filename}.${file.path.split('.').pop() !== file.path ? file.path.split('.').pop() : null}`}</p>
                        }
                    </React.Fragment>
                ))
            }
        </div>
    );
};

export default UploadedFiles;
