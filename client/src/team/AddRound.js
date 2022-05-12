import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';
import Combobox from 'react-widgets/Combobox';
import Toggle from 'react-toggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { displaySide, roundName } from '@speechanddebate/nsda-js-utils';

import { useStore } from '../helpers/store';
import { addRound, loadTabroomRounds } from '../helpers/api';
import { useDeviceDetect } from '../helpers/mobile';
import processFile from './processFile';

import Error from '../layout/Error';

import Breadcrumbs from '../layout/Breadcrumbs';
import SideDropdown from './SideDropdown';
import RoundNumberDropdown from './RoundNumberDropdown';
import Dropzone from './Dropzone';
import UploadedFiles from './UploadedFiles';
import CiteEditor from './CiteEditor';

import styles from './AddRound.module.css';

const AddRound = () => {
    const { caselist, school, team } = useParams();
    const navigate = useNavigate();
    const { isMobile } = useDeviceDetect();

    const { caselistData } = useStore();

    const {
        register,
        formState: { errors, isValid },
        handleSubmit,
        reset,
        setValue,
        control,
    } = useForm({
        mode: 'all',
        defaultValues: {
            tourn: '',
            side: '',
            round: '',
            opponent: '',
            judge: '',
            report: '',
            video: '',
            autodetect: true,
            opensource: null,
        },
    });
    const { fields, append, remove } = useFieldArray({ control, name: 'cites' });
    const watchFields = useWatch({ control });
    const autodetect = useWatch({ name: 'autodetect', control });

    const [fetchingRounds, setFetchingRounds] = useState(false);
    const [rounds, setRounds] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [files, setFiles] = useState([]);
    const [fileContent, setFileContent] = useState(null);
    const [filename, setFilename] = useState();

    // Have to use a ref to focus the Combobox when used in a Controller
    const tournRef = useRef();
    useEffect(() => {
        tournRef?.current?.focus();
    }, [tournRef]);

    // Calculate a filename for uploaded files
    useEffect(() => {
        let computed = `${school} ${team} `;
        computed += `${displaySide(watchFields.side, caselistData.event)} `;
        computed += `${watchFields.tourn?.trim()} `;
        computed += parseInt(watchFields.round) ? `Round ${watchFields.round}` : watchFields.round;
        setFilename(computed);
    }, [watchFields, school, team, caselistData]);

    // Add a default cite
    useEffect(() => {
        if (fields.length < 1) {
            append({ title: '', cites: '', open: true }, { shouldFocus: false });
        }
    }, [append, fields.length]);

    const fetchRounds = async () => {
        // Don't refetch on subsequent clicks
        if (rounds.length > 0) { return false; }
        try {
            setFetchingRounds(true);
            const tabroomRounds = await loadTabroomRounds(window.location.pathname) || [];
            tabroomRounds.unshift({
                id: 0,
                tourn: 'All Tournaments',
                round: 'All',
                side: 'A',
            });
            setRounds(tabroomRounds);
            setFetchingRounds(false);
        } catch (err) {
            setFetchingRounds(false);
            setRounds([]);
            console.log(err);
        }
    };

    const addRoundHandler = async (data) => {
        if (fileContent) {
            data.opensource = fileContent;
            data.filename = files[0].name;
        } else {
            data.opensource = null;
            data.filename = null;
        }

        // Ignore extra info if using the All Tournaments option
        if (data.tourn === 'All Tournaments') {
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

    const removeEmptyCites = useCallback(() => {
        fields.forEach((f, index) => {
            if (f.title === '' && f.cites === '') {
                remove(index);
            }
        });
    }, [fields, remove]);

    const onDrop = useCallback((acceptedFiles) => {
        return processFile(
            acceptedFiles,
            setFiles,
            autodetect,
            removeEmptyCites,
            setProcessing,
            setFileContent,
            append
        );
    }, [setFiles, autodetect, removeEmptyCites, setProcessing, setFileContent, append]);

    if (caselistData.archived) { return <Error message="This caselist is archived, no modifications allowed." />; }

    return (
        <div>
            <Breadcrumbs />

            <h2>Add a round to {school} {team}</h2>

            <form onSubmit={handleSubmit(addRoundHandler)} className={`pure-form pure-form-stacked ${isMobile && styles.mobile}`}>

                <div>
                    <label htmlFor="tourn">Tournament</label>
                    <Controller
                        control={control}
                        name="tourn"
                        rules={{ required: true, minLength: 2 }}
                        render={
                            ({
                                field: { onChange, onBlur, value },
                                fieldState: { error },
                            }) => (
                                <Combobox
                                    containerClassName={`${(!value || error) && styles.dirty}`}
                                    busy={fetchingRounds}
                                    ref={tournRef}
                                    hideCaret={fetchingRounds || rounds.length < 1}
                                    data={rounds}
                                    dataKey="id"
                                    textField={
                                        i => {
                                            if (typeof i === 'string') { return i; }
                                            if (i.tourn === 'All Tournaments') { return 'All Tournaments / General Disclosure'; }
                                            return `${i.tourn} ${roundName(i.round)} ${displaySide(i.side, caselistData.event)} vs ${i.opponent}`;
                                        }
                                    }
                                    hideEmptyPopup
                                    filter="contains"
                                    value={value}
                                    onChange={
                                        e => {
                                            if (typeof e === 'string') { return onChange(e); }
                                            setValue('round', e.round, { shouldValidate: true });
                                            setValue('side', e.side, { shouldValidate: true });
                                            setValue('opponent', e.opponent ?? '', { shouldValidate: true });
                                            setValue('judge', e.judge ?? '', { shouldValidate: true });
                                            return onChange(e.tourn);
                                        }
                                    }
                                    inputProps={
                                        {
                                            onFocus: fetchRounds,
                                            onBlur,
                                        }
                                    }
                                />
                            )
                        }
                    />
                </div>

                <div>
                    <label htmlFor="side">Side</label>
                    <Controller
                        control={control}
                        name="side"
                        rules={{ required: true }}
                        render={
                            ({
                                field: { onChange, value },
                                fieldState: { error },
                            }) => (
                                <SideDropdown
                                    className={(!value || error) && styles.dirty}
                                    value={value}
                                    onChange={onChange}
                                    event={caselistData?.event}
                                />
                            )
                        }
                    />
                </div>

                <div>
                    <label htmlFor="round">Round</label>
                    <Controller
                        control={control}
                        name="round"
                        rules={{ required: true }}
                        render={
                            ({
                                field: { onChange, value },
                                fieldState: { error },
                            }) => (
                                <RoundNumberDropdown
                                    className={(!value || error) && styles.dirty}
                                    value={value}
                                    onChange={onChange}
                                    disabled={watchFields.tourn === 'All Tournaments'}
                                />
                            )
                        }
                    />
                </div>

                <div>
                    <label htmlFor="opponent">Opponent</label>
                    <input
                        name="opponent"
                        type="text"
                        {...register('opponent')}
                        disabled={watchFields.tourn === 'All Tournaments'}
                    />
                </div>

                <div>
                    <label htmlFor="judge">Judge</label>
                    <input
                        name="judge"
                        type="text"
                        {...register('judge')}
                        disabled={watchFields.tourn === 'All Tournaments'}
                    />
                </div>

                <div>
                    <label htmlFor="report">
                        Round Report
                        <FontAwesomeIcon
                            className={styles.info}
                            icon={faInfoCircle}
                            title="Describe what happened in the round, what arguments were run, what was in rebuttals, etc."
                        />
                    </label>
                    <textarea
                        className={styles.report}
                        name="report"
                        {...register('report')}
                        disabled={watchFields.tourn === 'All Tournaments'}
                    />
                </div>

                <div>
                    <label htmlFor="video">
                        Video URL
                        <FontAwesomeIcon
                            className={styles.info}
                            icon={faInfoCircle}
                            title="Public URL to recording of the round (e.g. YouTube link), if available"
                        />
                    </label>
                    <input
                        name="video"
                        type="text"
                        {...register('video')}
                        disabled={watchFields.tourn === 'All Tournaments'}
                    />
                </div>

                <hr />
                <h4>Open Source</h4>
                {
                    files.length > 0 ?
                        <UploadedFiles
                            files={files}
                            filename={filename}
                            handleResetFiles={handleResetFiles}
                            showFilename={!errors.tourn && !errors.side && !errors.round}
                        />
                    :
                        <>
                            <div>
                                <label htmlFor="autodetect">
                                    <p>
                                        Auto-detect cites (works with <a href="https://paperlessdebate.com" target="_blank" rel="noopener noreferrer">Verbatim</a>)
                                    </p>
                                    <Controller
                                        control={control}
                                        name="autodetect"
                                        render={
                                            ({
                                                field: { onChange, value },
                                            }) => (
                                                <Toggle
                                                    className={styles.switch}
                                                    onChange={onChange}
                                                    checked={value}
                                                    height={20}
                                                    width={40}
                                                    id="autodetect"
                                                    name="autodetect"
                                                    value='yes'
                                                    icons={false}
                                                    aria-label="autodetect"
                                                />
                                            )
                                        }
                                    />
                                </label>
                            </div>
                            <Dropzone
                                name="opensource"
                                processing={processing}
                                onDrop={onDrop}
                                control={control}
                            />
                        </>
                }

                <hr />
                <h4>
                    Cites
                    <button
                        type="button"
                        onClick={() => append({ title: '', cites: '', open: false }, { shouldFocus: false })}
                        className={`${styles['add-cite']} pure-button`}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        <span> Add Cite</span>
                    </button>
                </h4>
                <p className={styles.prompt}>
                    Please consider adding cites even if you&apos;re also uploading an open source
                    document. They&apos;re the best way to see an overview of your past arguments
                    and improve the quality of your disclosure.
                </p>
                {
                    fields.map((item, index) => {
                        return (
                            <CiteEditor
                                key={item.id}
                                item={item}
                                index={index}
                                register={register}
                                control={control}
                                remove={remove}
                            />
                        );
                    })
                }

                <div className={styles.buttons}>
                    <button type="submit" className={`pure-button ${styles.add}`} disabled={!isValid}>Add Round</button>
                    <Link to={`/${caselist}/${school}/${team}`}>
                        <button type="button" className={`pure-button ${styles.cancel}`}>Cancel</button>
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default AddRound;
