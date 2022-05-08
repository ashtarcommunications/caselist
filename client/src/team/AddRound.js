import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';
import Combobox from 'react-widgets/Combobox';
import Toggle from 'react-toggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { displaySide, affName, negName } from '@speechanddebate/nsda-js-utils';

import { useStore } from '../helpers/store';
import { addRound, loadTabroomRounds } from '../helpers/api';
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
            setRounds(await loadTabroomRounds(window.location.pathname) || []);
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
        try {
            const response = await addRound(caselist, school, team, data);
            toast.success(response);
            reset();
            navigate(`/${caselist}/${school}/${team}`);
        } catch (err) {
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

            <form onSubmit={handleSubmit(addRoundHandler)} className="pure-form pure-form-stacked">

                <div className={styles['form-group']}>
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
                                        i => (
                                            typeof i === 'string'
                                            ? i
                                            : `${i.tourn} Round ${i.round} ${
                                                    i.side === 'A'
                                                    ? affName(caselistData.event)
                                                    : negName(caselistData.event)
                                            } vs ${i.opponent}`
                                        )
                                    }
                                    hideEmptyPopup
                                    filter="contains"
                                    value={value}
                                    onChange={
                                        e => {
                                            if (typeof e === 'string') { return onChange(e); }
                                            setValue('side', e.side, { shouldValidate: true });
                                            setValue('round', e.round, { shouldValidate: true });
                                            setValue('opponent', e.opponent, { shouldValidate: true });
                                            setValue('judge', e.judge, { shouldValidate: true });
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

                <div className={styles['form-group']}>
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

                <div className={styles['form-group']}>
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
                                />
                            )
                        }
                    />
                </div>

                <div className={styles['form-group']}>
                    <label htmlFor="opponent">Opponent</label>
                    <input
                        name="opponent"
                        type="text"
                        {...register('opponent', { required: true })}
                    />
                </div>

                <div className={styles['form-group']}>
                    <label htmlFor="judge">Judge</label>
                    <input
                        name="judge"
                        type="text"
                        {...register('judge', { required: true })}
                    />
                </div>

                <div className={styles['form-group']}>
                    <label htmlFor="report">
                        Round Report
                        <span title="Describe what happened in the round, what arguments were run, what was in rebuttals, etc.">
                            <FontAwesomeIcon
                                className={styles.info}
                                icon={faInfoCircle}
                            />
                        </span>
                    </label>
                    <textarea
                        className={styles.report}
                        name="report"
                        {...register('report')}
                    />
                </div>

                <div className={styles['form-group']}>
                    <label htmlFor="video">
                        Video URL
                        <span title="Public URL to recording of the round (e.g. YouTube link), if available">
                            <FontAwesomeIcon
                                className={styles.info}
                                icon={faInfoCircle}
                            />
                        </span>
                    </label>
                    <input
                        name="video"
                        type="text"
                        {...register('video')}
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
                            <div className={styles.flex}>
                                <label htmlFor="autodetect">
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
                                    <span className={styles['switch-label']}>
                                        Auto-detect cites (works with <a href="https://paperlessdebate.com" target="_blank" rel="noopener noreferrer">Verbatim</a>)
                                    </span>
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
                        <FontAwesomeIcon className={styles.plus} icon={faPlus} />
                        <span> Add Cite</span>
                    </button>
                </h4>
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
