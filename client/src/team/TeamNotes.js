import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

import { updateTeam } from '../helpers/api';

import styles from './TeamRounds.module.css';

const TeamNotes = ({ teamData }) => {
    const { caselist, school, team } = useParams();

    const {
        register,
        formState: { isDirty },
        handleSubmit,
        setValue,
        reset,
    } = useForm({
        mode: 'all',
        defaultValues: {
            notes: teamData.notes,
        },
    });
    useEffect(() => {
        setValue('notes', teamData.notes);
    }, [teamData, setValue]);

    const [fetching, setFetching] = useState(false);
    const [showNotes, setShowNotes] = useState(false);

    const handleToggleNotes = async () => {
        setShowNotes(!showNotes);
    };

    const updateNotesHandler = async (data) => {
        try {
            setFetching(true);
            const updates = [{ notes: data.notes }];
            const response = await updateTeam(caselist, school, team, updates);
            setFetching(false);
            reset({ keepDefaultValues: true, keepDirty: false });
            setShowNotes(false);
            toast.success(response.message);
        } catch (err) {
            toast.error(`Failed to update team: ${err.message}`);
            console.log(err);
        }
    };

    const handleCancel = () => {
        setValue('notes', teamData.notes);
        reset({ keepDefaultValues: true, keepDirty: false });
    };

    return (
        <div className={styles.notes}>
            <form onSubmit={handleSubmit(updateNotesHandler)} className="pure-form">
                <h4 onClick={handleToggleNotes}>
                    Team Notes
                    <FontAwesomeIcon
                        className={styles.info}
                        icon={faInfoCircle}
                        title="For team information, public contact info, pronouns, etc."
                    />
                    <FontAwesomeIcon
                        className={styles.shownotes}
                        icon={showNotes ? faCaretDown : faCaretUp}
                        title="Team notes"
                    />
                </h4>
                <br />
                {
                    showNotes &&
                    <textarea
                        id="team-notes"
                        {...register('notes')}
                    />
                }

                {
                    isDirty &&
                    <p className={styles.warning}>
                        Remember, this information is public -
                        if sharing contact info, consider using a dedicated
                        email address instead of a personal email
                    </p>
                }

                {
                    !fetching && isDirty &&
                    <div className={styles['notes-buttons']}>
                        <button type="submit" className={`pure-button ${styles.save}`}>
                            Save
                        </button>
                        <button onClick={handleCancel} type="button" className={`pure-button ${styles.cancel}`}>
                            Cancel
                        </button>
                    </div>
                }
            </form>
        </div>
    );
};

export default TeamNotes;
