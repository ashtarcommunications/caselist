import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { displaySide, roundName } from '@speechanddebate/nsda-js-utils';

import { useStore } from '../helpers/store';
import { updateRound, loadRound } from '../helpers/api';
import { useDeviceDetect } from '../helpers/mobile';

import Error from '../layout/Error';
import Loader from '../loader/Loader';

import Breadcrumbs from '../layout/Breadcrumbs';
import SideDropdown from './SideDropdown';
import RoundNumberDropdown from './RoundNumberDropdown';

import styles from './EditRound.module.css';

const EditRound = () => {
    const { caselist, school, team, round } = useParams();
    const navigate = useNavigate();
    const { isMobile } = useDeviceDetect();

    const { caselistData } = useStore();

    const {
        register,
        formState: { isValid, isDirty },
        handleSubmit,
        reset,
        setValue,
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
            opensource: '',
            video: '',
        },
    });

    const watchFields = useWatch({ control });

    const [fetching, setFetching] = useState(false);
    const [oldRoundName, setOldRoundName] = useState('');

    useEffect(() => {
        const fetchRound = async () => {
            try {
                setFetching(true);
                const oldRound = await loadRound(caselist, school, team, round) || {};

                // Set default form values to the existing round
                setValue('tournament', oldRound.tournament);
                setValue('side', oldRound.side);
                setValue('round', oldRound.round);
                setValue('opponent', oldRound.opponent);
                setValue('judge', oldRound.judge);
                setValue('report', oldRound.report);
                setValue('opensource', oldRound.opensource);
                setValue('video', oldRound.video);

                let name = `${oldRound.tournament} ${roundName(oldRound.round)} ${displaySide(oldRound.side)}`;
                name += oldRound.opponent ? ` vs ${oldRound.opponent}` : '';
                setOldRoundName(name);

                setFetching(false);
            } catch (err) {
                setFetching(false);
                toast.error('Failed to load round');
                console.log(err);
            }
        };
        fetchRound();
    }, [caselist, school, team, round, setFetching, setValue]);

    const updateRoundHandler = async (data) => {
        try {
            console.log(round);
            const response = await updateRound(caselist, school, team, round, data);
            toast.success(response.message);
            reset({}, { keepDefaultValues: true });
            navigate(`/${caselist}/${school}/${team}`);
        } catch (err) {
            toast.error(`Failed to update round: ${err.message}`);
            console.log(err);
        }
    };

    const handleRemoveFile = () => {
        setValue('opensource', null);
    };

    if (caselistData.archived) { return <Error message="This caselist is archived, no modifications allowed." />; }

    if (fetching) { return <Loader />; }
    return (
        <div>
            <Breadcrumbs />

            <h2>Edit {school} {team} - {oldRoundName}</h2>

            <form onSubmit={handleSubmit(updateRoundHandler)} className={`pure-form pure-form-stacked ${isMobile && styles.mobile}`}>

                <div>
                    <label htmlFor="tournament">Tournament</label>
                    <input
                        name="tournament"
                        type="text"
                        {...register('tournament', { required: true })}
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
                                    className={(!value || error) && styles.error}
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
                                    className={(!value || error) && styles.error}
                                    value={value}
                                    onChange={onChange}
                                    disabled={watchFields.tournament === 'All Tournaments'}
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
                        disabled={watchFields.tournament === 'All Tournaments'}
                    />
                </div>

                <div>
                    <label htmlFor="judge">Judge</label>
                    <input
                        name="judge"
                        type="text"
                        {...register('judge')}
                        disabled={watchFields.tournament === 'All Tournaments'}
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
                        disabled={watchFields.tournament === 'All Tournaments'}
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
                        disabled={watchFields.tournament === 'All Tournaments'}
                    />
                </div>
                {
                    watchFields.opensource &&
                    <p>
                        <span>Uploaded Open Source File: </span>
                        {watchFields.opensource.split('/').pop()}
                        <FontAwesomeIcon
                            className={styles.trash}
                            icon={faTrash}
                            onClick={handleRemoveFile}
                        />
                    </p>
                }

                <div className={styles.buttons}>
                    <button type="submit" className={`pure-button ${styles.submit}`} disabled={!isValid || !isDirty}>Save</button>
                    <Link to={`/${caselist}/${school}/${team}`}>
                        <button type="button" className={`pure-button ${styles.cancel}`}>Cancel</button>
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default EditRound;
