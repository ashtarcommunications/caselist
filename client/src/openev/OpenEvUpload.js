import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';

import { addOpenEvFile } from '../helpers/api';
import { useDeviceDetect } from '../helpers/mobile';

import Dropzone from '../team/Dropzone';
import UploadedFiles from '../team/UploadedFiles';

import styles from './OpenEvUpload.module.css';
import { notTitleCase } from '../helpers/common';

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
        let computed = `${watchFields.title} - ${watchFields.camp} ${year}`;
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

        try {
            const response = await addOpenEvFile(data);
            toast.success(response.message);
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
                    <label htmlFor="name">File Title</label>
                    <input
                        name="title"
                        type="text"
                        {...register('title')}
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
                        {...register('camp')}
                    >
                        <option value="">Choose a camp</option>
                        <option value="CNDI">Berkeley</option>
                        <option value="BDL">Boston Debate League</option>
                        <option value="DDI">Dartmouth DDI</option>
                        <option value="DDIx">Dartmouth DDIx</option>
                        <option value="ENDI">Emory (ENDI)</option>
                        <option value="GDS">Georgetown (GDS)</option>
                        <option value="GDI">Gonzaga (GDI)</option>
                        <option value="JDI">Kansas (JDI)</option>
                        <option value="MGC">Mean Green Comet</option>
                        <option value="UM7">Michigan (7-Week)</option>
                        <option value="UMC">Michigan (Classic)</option>
                        <option value="MNDI">Michigan (MNDI)</option>
                        <option value="SDI">Michigan State (SDI)</option>
                        <option value="MSDI">Missouri State (MSDI)</option>
                        <option value="NSD">National Symposium for Debate</option>
                        <option value="NHSI">Northwestern (NHSI)</option>
                        <option value="SSDI">Samford</option>
                        <option value="UTNIF">Texas (UTNIF)</option>
                        <option value="TDI">The Debate Intensive</option>
                        <option value="RKS">Wake Forest (RKS)</option>
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
                        && watchFields.lab.charAt(0) !== watchFields.lab.charAt(0).toUpperCase()
                        && <p className={styles.warning}>Lab initials should be in all caps</p>
                    }
                </div>

                <div>
                    <label htmlFor="tags">Tags</label>
                    <input
                        name="aff"
                        type="checkbox"
                        {...register('aff')}
                    /> Affirmatives
                    <input
                        name="neg"
                        type="checkbox"
                        {...register('neg')}
                    /> Case Negatives
                </div>

                <hr />
                <p>
                    File will be renamed:
                </p>

                <div className={styles.buttons}>
                    <button type="submit" className={`pure-button ${styles.add}`} disabled={!isValid}>Upload</button>
                    <Link to={`/openev/${year}`}>
                        <button type="button" className={`pure-button ${styles.cancel}`}>Cancel</button>
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default OpenEvUpload;
