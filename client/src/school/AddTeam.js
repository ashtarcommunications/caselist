import React from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useStore } from '../helpers/store';
import { addTeam } from '../helpers/api';
import './AddTeam.css';

const AddTeam = () => {
    const { caselist, school } = useParams();
    const { register, handleSubmit, reset } = useForm();
    const { caselist: caselistData, fetchTeams } = useStore();

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
                    <input
                        type="text"
                        id="debater1-first"
                        placeholder="Debater #1 First Name"
                        {...register('debater1_first', { required: true, minLength: 2 })}
                    />
                    <input
                        type="text"
                        id="debater1-last"
                        placeholder="Debater #1 Last Name"
                        {...register('debater1_last', { required: true, minLength: 2 })}
                    />
                </div>
                <br />
                {
                    caselistData.team_size > 1 &&
                    <div>
                        <input
                            type="text"
                            id="debater2-first"
                            placeholder="Debater #2 First Name"
                            {...register('debater2_first', { required: true, minLength: 2 })}
                        />
                        <input
                            type="text"
                            id="debater2-last"
                            placeholder="Debater #2 Last Name"
                            {...register('debater2_last', { required: true, minLength: 2 })}
                        />
                    </div>
                }
                <button className="pure-button green" type="submit">Add</button>
            </form>
        </div>
    );
};

export default AddTeam;
