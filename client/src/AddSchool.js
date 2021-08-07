import React from 'react';
import { addSchool } from './api';

function AddSchool() {
    const addSchoolHandler = async (e) => {
        e.preventDefault();
        try {
            await addSchool('ndtceda21', { name: 'Test School', display_name: 'Test School' });
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            <form onSubmit={addSchoolHandler}>
                School Name: <input type="text" />
                <button type="submit">Add</button>
            </form>
        </div>
    );
}

export default AddSchool;
