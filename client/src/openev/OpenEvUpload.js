import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';

import { addOpenEvFile } from '../helpers/api';
import { useDeviceDetect } from '../helpers/mobile';
import { notTitleCase, campAbbreviations, campDisplayName, tagAbbreviations } from '../helpers/common';

import Dropzone from '../team/Dropzone';
import UploadedFiles from '../team/UploadedFiles';

import styles from './OpenEvUpload.module.css';

const OpenEvUpload = () => {
    const { year } = useParams();
    const { isMobile } = useDeviceDetect();

    const {
        register,
        formState: { errors, isValid },
        handleSubmit,
        setValue,
        control,
    } = useForm({
        mode: 'all',
        defaultValues: {
            title: '',
            camp: '',
            lab: '',
        },
    });
    const watchFields = useWatch({ control });

    const [files, setFiles] = useState([]);
    const [fileContent, setFileContent] = useState(null);
    const [filename, setFilename] = useState();

    // Calculate a filename for uploaded files
    useEffect(() => {
        let computed = `${watchFields.title} - ${campDisplayName[watchFields.camp] || ''} ${year}`;
        if (watchFields.lab) {
            computed += ` ${watchFields.lab}`;
        }
        setFilename(computed);
    }, [watchFields, year]);

    const handleResetFiles = () => {
        setFiles([]);
        setFileContent(null);
    };

    const uploadFileHandler = async (data) => {
        if (!fileContent) { return false; }
        data.year = parseInt(year);
        data.file = fileContent;
        data.filename = files[0].name;

        data.tags = {};
        Object.keys(tagAbbreviations).forEach(tag => {
            if (data[tag]) {
                data.tags[tag] = true;
            }
        });

        try {
            const response = await addOpenEvFile(data);
            toast.success(response.message);

            // Reset title and file, leave rest of form for easier back-to-back upload
            setValue('title', '');
            handleResetFiles();
        } catch (err) {
            toast.error(`Failed to add file: ${err.message}`);
            console.log(err);
        }
    };

    const onDrop = useCallback((acceptedFiles) => {
        setFiles(acceptedFiles);
        acceptedFiles.forEach((file) => {
            const reader = new FileReader();

            reader.onabort = () => console.log('File reading was aborted');
            reader.onerror = () => console.log('File reading has failed');
            reader.onload = async () => {
                // Convert to base64 for upload
                const binaryStr = reader.result;
                let binary = '';
                const bytes = new Uint8Array(binaryStr);
                const len = bytes.byteLength;
                for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                setFileContent(window.btoa(binary));
            };
            reader.readAsArrayBuffer(file);
        });
    }, []);

    return (
        <div>
            <h2>Upload a file to Open Evidence {year}</h2>

            <form onSubmit={handleSubmit(uploadFileHandler)} className={`pure-form pure-form-stacked ${isMobile && styles.mobile}`}>
                {
                    files.length > 0 ?
                        <UploadedFiles
                            files={files}
                            filename={filename}
                            handleResetFiles={handleResetFiles}
                            showFilename={!errors.title && !errors.camp && !errors.lab}
                        />
                        :
                        <Dropzone
                            name="file"
                            onDrop={onDrop}
                            control={control}
                        />
                }

                <div>
                    <label htmlFor="title">File Title (don&apos;t include camp name)</label>
                    <input
                        name="title"
                        type="text"
                        {...register('title', { required: true })}
                    />
                    {
                        notTitleCase.test(watchFields.title) &&
                        <p className={styles.warning}>Please use title case</p>
                    }
                </div>

                <div>
                    <label htmlFor="camp">Camp</label>
                    <select
                        name="camp"
                        {...register('camp', { required: true })}
                    >
                        <option value="">Choose a camp</option>
                        {
                            Object.keys(campAbbreviations).map(camp => {
                                return (
                                    <option key={camp} value={camp}>
                                        {campAbbreviations[camp]}
                                    </option>
                                );
                            })
                        }
                    </select>
                </div>

                <div>
                    <label htmlFor="lab">Lab (OPTIONAL - use initials)</label>
                    <input
                        name="lab"
                        type="text"
                        {...register('lab')}
                    />
                    {
                        watchFields.lab
                        && watchFields.lab !== watchFields.lab?.toUpperCase()
                        && <p className={styles.warning}>Lab initials should be in all caps</p>
                    }
                </div>

                <div>
                    <label htmlFor="tags">Tags</label>
                    {
                        Object.keys(tagAbbreviations).map(tag => {
                            return (
                                <div key={tag} className={styles.tag}>
                                    <label htmlFor={tag}>
                                        <input
                                            id={tag}
                                            type="checkbox"
                                            {...register(tag)}
                                        />
                                        <span>{tagAbbreviations[tag]}</span>
                                    </label>
                                </div>
                            );
                        })

                    }
                </div>

                <hr />

                <div className={styles.buttons}>
                    <button type="submit" className={`pure-button ${styles.add}`} disabled={!isValid || !fileContent}>Upload</button>
                    <Link to={`/openev/${year}`}>
                        <button type="button" className={`pure-button ${styles.cancel}`}>Cancel</button>
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default OpenEvUpload;
