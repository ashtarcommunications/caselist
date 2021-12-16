import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { useStore } from '../helpers/store';
import { addTeam, loadTabroomStudents } from '../helpers/api';
import './AddTeam.css';

const AddTeam = () => {
    const { caselist, school } = useParams();
    const { register, handleSubmit, reset, control } = useForm();
    const { caselist: caselistData, fetchTeams } = useStore();

    const [students, setStudents] = useState([]);

    const loadStudents = () => {
        const fetchStudents = async () => {
            try {
                const response = await loadTabroomStudents();
                setStudents(response || []);
            } catch (err) {
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
            await addTeam(caselist, school, {
                debater1_first: data.debater1_first,
                debater1_last: data.debater1_last,
                debater2_first: data.debater2_first,
                debater2_last: data.debater2_last,
            });
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
                                    name={`debater${i + 1}-first`}
                                    render={
                                        ({ field: { onChange, onBlur, value } }) => (
                                            <Select
                                                id={`debater${i + 1}-first`}
                                                options={
                                                    students.map((s) => {
                                                        return {
                                                            value: s.first,
                                                            label: `${s.first} ${s.last}`,
                                                        };
                                                    })
                                                }
                                                value={value}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                onFocus={loadStudents}
                                                required
                                            />
                                        )
                                    }
                                />
                                <input
                                    type="text"
                                    id={`debater${i + 1}-first`}
                                    placeholder={`Debater #${i + 1} First Name`}
                                    {...register(`debater${i + 1}_first`, { required: true, minLength: 2 })}
                                />
                                <input
                                    type="text"
                                    id={`debater${i + 1}-last`}
                                    placeholder={`Debater #${i + 1} Last Name`}
                                    {...register(`debater${i + 1}_last`, { required: true, minLength: 2 })}
                                />
                                <br />
                            </React.Fragment>
                        ))
                    }
                </div>
                <button className="pure-button green" type="submit">Add</button>
            </form>
        </div>
    );
};

export default AddTeam;
