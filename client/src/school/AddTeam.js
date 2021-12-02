import React from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { addTeam } from '../helpers/api';
import './AddTeam.css';

const AddTeam = () => {
    const { caselist, school } = useParams();
    const { register, handleSubmit } = useForm();

    const addTeamHandler = async (data) => {
        try {
            await addTeam(caselist, school, {
                debater1_first: data.debater1_first,
                debater1_last: data.debater1_last,
                debater2_first: data.debater2_first,
                debater2_last: data.debater2_last,
            });
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit(addTeamHandler)} className="add-team pure-form">
                <div>
                    <p>Auto-detected Teams</p>
                    <select id="auto-teams">
                        <option value="" {...register('auto-team')}>Choose a team</option>
                    </select>
                </div>
                <p>Or...</p>
                <div>
                    <p>Debater #1</p>
                    <select id="auto-debater1">
                        <option value="" {...register('auto-debater1')}>Choose a debater</option>
                    </select>
                    <input type="text" id="debater1-first" placeholder="First Name" {...register('debater1_first')} />
                    <input type="text" id="debater1-last" placeholder="Last Name" {...register('debater1_last')} />
                </div>
                <br />
                <div>
                    <p>Debater #2</p>
                    <select id="auto-debater2">
                        <option value="">Choose a debater</option>
                    </select>
                    <input type="text" id="debater2-first" placeholder="First Name" {...register('debater2_first')} />
                    <input type="text" id="debater2-last" placeholder="Last Name" {...register('debater2_last')} />
                </div>
                <button className="pure-button pure-button-primary" type="submit">Add</button>
            </form>
        </div>
    );
};

export default AddTeam;
