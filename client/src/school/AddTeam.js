import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import Combobox from 'react-widgets/Combobox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

import { useStore } from '../helpers/store';
import { addTeam, loadTabroomStudents } from '../helpers/api';

import 'react-widgets/styles.css';
import styles from './AddTeam.module.css';

const AddTeam = () => {
    const { caselist, school } = useParams();
    const {
        handleSubmit,
        reset,
        control,
        setValue,
        formState: { isValid },
    } = useForm({
        mode: 'all',
        defaultValues: {
            debater1_first: '',
            debater1_last: '',
            debater2_first: '',
            debater2_last: '',
            debater3_first: '',
            debater3_last: '',
            debater4_first: '',
            debater4_last: '',
        },
    });

    const watchFields = useWatch({ control });

    const { caselistData, fetchTeams } = useStore();

    const [fetching, setFetching] = useState(false);
    const [students, setStudents] = useState([]);
    const [teamSize, setTeamSize] = useState(caselistData.team_size);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        let warn = false;
        Object.keys(watchFields).forEach(f => {
            if (watchFields[f]
                && watchFields[f]?.charAt(0) === watchFields[f]?.charAt(0)?.toLowerCase()
            ) {
                warn = true;
            }
        });
        setShowWarning(warn);
    }, [watchFields]);

    const loadStudents = () => {
        const fetchStudents = async () => {
            try {
                setFetching(true);
                const response = await loadTabroomStudents();
                setStudents(response || []);
                setFetching(false);
            } catch (err) {
                setFetching(false);
                setStudents([]);
                console.log(err);
            }
        };
        if (students.length < 1) {
            fetchStudents();
        }
    };

    const addTeamHandler = async (data) => {
        try {
            if (!data) { return false; }
            const response = await addTeam(caselist, school, data);
            toast.success(response.message);
            reset({ keepDefaultValues: true });
            fetchTeams(caselist, school);
        } catch (err) {
            console.log(err);
            toast.error(`Failed to add team: ${err.message}`);
        }
    };

    const addStudentHandler = () => {
        if (teamSize >= 4) { return false; }
        setTeamSize(teamSize + 1);
    };

    const removeStudentHandler = () => {
        if (teamSize <= caselistData.teamSize) { return false; }
        setTeamSize(teamSize - 1);
    };

    return (
        <div>
            <h3>Add a {caselistData.team_size > 1 ? 'Team' : 'Debater'}</h3>
            <form onSubmit={handleSubmit(addTeamHandler)} className={`${styles['add-team']} pure-form}`}>
                <div>
                    {
                        Array.from({ length: teamSize }).map((x, i) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <div className={styles.flex} key={i}>
                                <Controller
                                    control={control}
                                    name={`debater${i + 1}_first`}
                                    rules={{ required: true, minLength: 2 }}
                                    render={
                                        ({
                                            field: { onChange, onBlur, value },
                                            fieldState: { error },
                                        }) => (
                                            <div className={styles.first}>
                                                <label htmlFor={`debater${i + 1}_first`}>Debater #{i + 1} First</label>
                                                <Combobox
                                                    containerClassName={`${styles.combo} ${error ? styles.dirty : undefined}`}
                                                    busy={fetching}
                                                    hideCaret={fetching || students.length < 1}
                                                    data={students}
                                                    dataKey="id"
                                                    textField="name"
                                                    hideEmptyPopup
                                                    filter="contains"
                                                    value={value}
                                                    onChange={
                                                        e => {
                                                            if (typeof e === 'string') { return onChange(e); }
                                                            setValue(`debater${i + 1}_last`, e.last);
                                                            return onChange(e.first);
                                                        }
                                                    }
                                                    inputProps={
                                                        { onFocus: loadStudents, onBlur }
                                                    }
                                                />
                                            </div>
                                        )
                                    }
                                />
                                <Controller
                                    control={control}
                                    name={`debater${i + 1}_last`}
                                    rules={{ required: true, minLength: 2 }}
                                    render={
                                        ({ field: { onChange, onBlur, value } }) => (
                                            <div>
                                                <label htmlFor={`debater${i + 1}_last`}>Debater #{i + 1} Last</label>
                                                <Combobox
                                                    containerClassName={`${styles.combo}`}
                                                    busy={fetching}
                                                    hideCaret={fetching || students.length < 1}
                                                    data={students}
                                                    dataKey="id"
                                                    textField="name"
                                                    hideEmptyPopup
                                                    filter="contains"
                                                    value={value}
                                                    onChange={
                                                        e => {
                                                            if (typeof e === 'string') { return onChange(e); }
                                                            setValue(`debater${i + 1}_first`, e.first);
                                                            return onChange(e.last);
                                                        }
                                                    }
                                                    inputProps={
                                                        { onFocus: loadStudents, onBlur }
                                                    }
                                                />
                                            </div>
                                        )
                                    }
                                />
                                <br />
                            </div>
                        ))
                    }
                    <div className={styles.addremove}>
                        {
                            teamSize > caselistData.team_size &&
                            <button
                                type="button"
                                className={`${styles['remove-debater']} pure-button`}
                                onClick={removeStudentHandler}
                            >
                                <FontAwesomeIcon className={styles.minus} icon={faMinus} />
                            </button>
                        }
                        {
                            teamSize < 4 &&
                            <button
                                type="button"
                                className={`${styles['add-debater']} pure-button`}
                                onClick={addStudentHandler}
                            >
                                <FontAwesomeIcon className={styles.plus} icon={faPlus} />
                            </button>
                        }
                    </div>
                </div>
                {
                    showWarning &&
                    <p className={styles.warning}>Please use title case for debater names</p>
                }
                <button className={`${styles['add-team-button']} pure-button`} type="submit" disabled={!isValid}>Add</button>
            </form>
        </div>
    );
};

export default AddTeam;
