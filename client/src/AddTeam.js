import React from 'react';
import { addTeam } from './api';
import './AddTeam.css';

const AddTeam = () => {
    const addTeamHandler = async (e) => {
        e.preventDefault();
        try {
            await addTeam('ndtceda21', 'Northwestern', { name: 'Test Team', code: 'TestXaXb' });
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            <form onSubmit={addTeamHandler} className="add-team pure-form">
                <div>
                    <label htmlFor="auto-teams">Auto-detected Teams</label>
                    <select id="auto-teams">
                        <option value="">Choose a team</option>
                    </select>
                </div>
                <p>Or...</p>
                <div>
                    <label htmlFor="auto-debater1">Debater #1</label>
                    <select id="auto-debater1">
                        <option value="">Choose a debater</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="debater1-first">First Name</label>
                    <input type="text" id="debater1-first" />
                </div>
                <div>
                    <label htmlFor="debater1-last">Last Name</label>
                    <input type="text" id="debater1-last" />
                </div>
                <br />

                <div>
                    <label htmlFor="auto-debater2">Debater #2</label>
                    <select id="auto-debater2">
                        <option value="">Choose a debater</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="debater2-first">First Name</label>
                    <input type="text" id="debater2-first" />
                </div>
                <div>
                    <label htmlFor="debater2-last">Last Name</label>
                    <input type="text" id="debater2-last" />
                </div>
                <button className="pure-button pure-button-primary" type="submit">Add</button>
            </form>
        </div>
    );
};

export default AddTeam;
