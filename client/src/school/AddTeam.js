import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import Combobox from 'react-widgets/Combobox';

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
        formState: { errors },
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
    const { caselistData, fetchTeams } = useStore();

    const [fetching, setFetching] = useState(false);
    const [students, setStudents] = useState([]);

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
            await addTeam(caselist, school, data);
            toast.success('Team added');
            reset({ keepDefaultValues: true });
            fetchTeams(caselist, school);
        } catch (err) {
            console.log(err);
            toast.error(err.message);
        }
    };

    return (
        <div>
            <h3>Add a {caselistData.team_size > 1 ? 'Team' : 'Debater'}</h3>
            <form onSubmit={handleSubmit(addTeamHandler)} className={`${styles['add-team']} pure-form}`}>
                <div>
                    {
                        Array.from({ length: caselistData.team_size }).map((x, i) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <div className={styles.flex} key={i}>
                                <Controller
                                    control={control}
                                    name={`debater${i + 1}_first`}
                                    rules={{ required: true, minLength: 2 }}
                                    render={
                                        ({
                                            field: { onChange, onBlur, value },
                                            fieldState: { invalid },
                                        }) => (
                                            <div className={styles.first}>
                                                <label htmlFor={`debater${i + 1}_first`}>Debater #{i + 1} First</label>
                                                <Combobox
                                                    containerClassName={`${styles.combo} ${invalid ? styles.dirty : undefined}`}
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
                </div>
                <button className={`${styles['add-team-button']} pure-button`} type="submit" disabled={Object.keys(errors).length > 0}>Add</button>
            </form>
        </div>
    );
};

export default AddTeam;
