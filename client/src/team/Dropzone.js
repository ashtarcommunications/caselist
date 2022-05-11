import React from 'react';
import { Controller } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';

import Loader from '../loader/Loader';

import styles from './Dropzone.module.css';

const Dropzone = ({ name, processing, onDrop, control }) => {
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        multiple: false,
        maxFiles: 1,
        maxSize: 10000000,
        acceptedFiles: '.docx,.doc,.txt,.rtf,.pdf',
    });

    if (processing) { return <Loader />; }

    return (
        <Controller
            control={control}
            name={name}
            render={
                ({
                    field: { onChange },
                }) => (
                    <div
                        className={styles.dropzone}
                        {...getRootProps()}
                    >
                        <div>
                            <input
                                {...getInputProps(
                                    { onChange: (e) => (onChange(e.target.files[0])) }
                                )}
                            />
                            <p>Drag and drop a file here, or click to select file</p>
                        </div>
                    </div>
                )
            }
        />
    );
};

export default Dropzone;
