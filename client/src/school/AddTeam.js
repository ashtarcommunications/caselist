import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import Combobox from 'react-widgets/Combobox';
import { useStore } from '../helpers/store';
import { addTeam, loadTabroomStudents } from '../helpers/api';
import './AddTeam.css';
import 'react-widgets/styles.css';

const AddTeam = () => {
    const { caselist, school } = useParams();
    const { handleSubmit, reset, control, setValue } = useForm();
    const { caselist: caselistData, fetchTeams } = useStore();

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
        console.log(data);
        try {
            if (data) { return false; }
            await addTeam(caselist, school, data);
            toast.success('Team added');
            reset();
            fetchTeams(caselist, school);
        } catch (err) {
            console.log(err);
            toast.error(err.message);
        }
    };

    return (
        <div>
            <h3>Add a {caselistData.team_size > 1 ? 'Team' : 'Debater'}</h3>
            <form onSubmit={handleSubmit(addTeamHandler)} className="add-team pure-form">
                <div>
                    {
                        Array.from({ length: caselistData.team_size }).map((x, i) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <React.Fragment key={i}>
                                <Controller
                                    control={control}
                                    name={`debater${i + 1}_first`}
                                    rules={{ required: true, minLength: 2 }}
                                    render={
                                        ({ field: { onChange, onBlur, value } }) => (
                                            <Combobox
                                                containerClassName="combo"
                                                busy={fetching}
                                                hideCaret={fetching || students.length < 1}
                                                data={students}
                                                dataKey="id"
                                                textField="name"
                                                hideEmptyPopup
                                                filter="contains"
                                                placeholder={`Debater #${i + 1} First`}
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
                                        )
                                    }
                                />
                                <Controller
                                    control={control}
                                    name={`debater${i + 1}_last`}
                                    rules={{ required: true, minLength: 2 }}
                                    render={
                                        ({ field: { onChange, onBlur, value } }) => (
                                            <Combobox
                                                containerClassName="combo last"
                                                busy={fetching}
                                                hideCaret={fetching || students.length < 1}
                                                data={students}
                                                dataKey="id"
                                                textField="name"
                                                hideEmptyPopup
                                                filter="contains"
                                                placeholder={`Debater #${i + 1} Last`}
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
                                        )
                                    }
                                />
                                <br />
                            </React.Fragment>
                        ))
                    }
                </div>
                <button className="pure-button green add-team-button" type="submit">Add</button>
            </form>
        </div>
    );
};

export default AddTeam;
