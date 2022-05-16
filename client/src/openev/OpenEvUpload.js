import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import { displaySide, roundName } from '@speechanddebate/nsda-js-utils';

import { useStore } from '../helpers/store';
import { addRound } from '../helpers/api';
import { useDeviceDetect } from '../helpers/mobile';

import Error from '../layout/Error';

import Breadcrumbs from '../layout/Breadcrumbs';
import Dropzone from '../team/Dropzone';
import UploadedFiles from '../team/UploadedFiles';

import styles from './OpenEvUpload.module.css';

const OpenEvUpload = () => {
    const { caselist, year, school, team } = useParams();
    const navigate = useNavigate();
    const { isMobile } = useDeviceDetect();

    const { caselistData } = useStore();

    const {
        register,
        formState: { errors, isValid },
        handleSubmit,
        reset,
        control,
    } = useForm({
        mode: 'all',
        defaultValues: {
            tournament: '',
            side: '',
            round: '',
            opponent: '',
            judge: '',
            report: '',
            autodetect: true,
            opensource: null,
            video: '',
        },
    });
    const { fields, append } = useFieldArray({ control, name: 'cites' });
    const watchFields = useWatch({ control });

    const [files, setFiles] = useState([]);
    const [fileContent, setFileContent] = useState(null);
    const [filename, setFilename] = useState();

    // Have to use a ref to focus the Combobox when used in a Controller
    const tournamentRef = useRef();
    useEffect(() => {
        tournamentRef?.current?.focus();
    }, [tournamentRef]);

    // Calculate a filename for uploaded files
    useEffect(() => {
        let computed = `${school}-${team}-`;
        computed += `${displaySide(watchFields.side, caselistData.event)}-`;
        computed += `${watchFields.tournament?.trim().replace(' ', '-')}-`;
        computed += watchFields.round === 'All' ? 'All-Rounds' : roundName(watchFields.round).replace(' ', '-');
        setFilename(computed);
    }, [watchFields, school, team, caselistData]);

    // Add a default cite
    useEffect(() => {
        if (fields.length < 1) {
            append({ title: '', cites: '', open: true }, { shouldFocus: false });
        }
    }, [append, fields.length]);

    const uploadFileHandler = async (data) => {
        if (fileContent) {
            data.opensource = fileContent;
            data.filename = files[0].name;
        } else {
            data.opensource = null;
            data.filename = null;
        }

        // Ignore extra info if using the All Tournaments option
        if (data.tournament === 'All Tournaments') {
            data.round = 'All';
            data.opponent = null;
            data.judge = null;
            data.report = null;
            data.video = null;
        }

        try {
            const response = await addRound(caselist, school, team, data);
            toast.success(response.message);
            reset({}, { keepDefaultValues: true });
            navigate(`/${caselist}/${school}/${team}`);
        } catch (err) {
            toast.error(`Failed to add round: ${err.message}`);
            console.log(err);
        }
    };

    const handleResetFiles = () => {
        setFiles([]);
        setFileContent(null);
    };

    const onDrop = useCallback((acceptedFiles) => {
        console.log(acceptedFiles);
    }, []);

    if (caselistData.archived) { return <Error message="This caselist is archived, no modifications allowed." />; }

    return (
        <div>
            <Breadcrumbs />

            <h2>Upload a file to Open Evidence {year}</h2>

            <form onSubmit={handleSubmit(uploadFileHandler)} className={`pure-form pure-form-stacked ${isMobile && styles.mobile}`}>
                {
                    files.length > 0 ?
                        <UploadedFiles
                            files={files}
                            filename={filename}
                            handleResetFiles={handleResetFiles}
                            showFilename={!errors.tournament && !errors.side && !errors.round}
                        />
                        :
                        <Dropzone
                            name="opensource"
                            // processing={processing}
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
                </div>

                <div>
                    <label htmlFor="camp">Camp</label>
                    <select
                        name="camp"
                        {...register('camp')}
                    >
                        <option value="">Choose a camp</option>
                        <option value="CNDI">Berkeley</option>
                        <option value="SDI">Michigan State (SDI)</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="lab">Lab</label>
                    <input
                        name="lab"
                        type="text"
                        {...register('lab')}
                    />
                </div>

                <div>
                    <label htmlFor="aff">Aff</label>
                    <input
                        name="aff"
                        type="checkbox"
                        {...register('aff')}
                    />
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
