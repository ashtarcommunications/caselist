import React from 'react';
import { addRound } from './api';

const AddRound = () => {
    const addRoundHandler = async (e) => {
        e.preventDefault();
        try {
            await addRound(
                'ndtceda21',
                'Northwestern',
                'XaXb',
                { side: 'Aff', tournament: 'Test Tournament' });
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            <form onSubmit={addRoundHandler} className="pure-form pure-form-stacked">
                Tournament: <input type="text" />
                Round: <input type="text" />
                Opponent: <input type="text" />
                Judge: <input type="text" />
                Round Report: <input type="text" />
                Video: <input type="text" />
                Cites: <input type="text" />
                <button type="submit">Add</button>
            </form>
        </div>
    );
};

export default AddRound;
