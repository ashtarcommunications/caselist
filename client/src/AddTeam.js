import React from 'react';
import { addTeam } from './api';

function AddTeam() {
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
            <form onSubmit={addTeamHandler} className="pure-form pure-form-stacked">
                Team Name: <input type="text" />
                <button type="submit">Add</button>
            </form>
        </div>
    );
}

export default AddTeam;
