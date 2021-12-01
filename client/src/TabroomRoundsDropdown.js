import React, { useState } from 'react';
import { loadTabroomRounds } from './api';

const TabroomRoundsDropdown = () => {
    const [rounds, setRounds] = useState([]);

    const fetchRounds = async () => {
        // Don't refetch on subsequent clicks
        if (rounds.length > 0) { return false; }
        try {
            setRounds(await loadTabroomRounds(window.location.pathname) || []);
        } catch (err) {
            console.log(err);
            setRounds([]);
        }
    };

    const handleChangeRound = (e) => {
        e.preventDefault();
    };

    return (
        <div>
            <form className="form pure-form">
                <select
                    onBlur={fetchRounds}
                    onClick={fetchRounds}
                    onChange={handleChangeRound}
                >
                    <option value="">Choose a Round</option>
                    {
                        rounds.length > 0
                        ? rounds.map(r => {
                            return (
                                <option
                                    key={r.id}
                                    value={r.id}
                                >
                                    {r.tourn} Round {r.round}
                                </option>
                            );
                        })
                        : <option value="">Loading Tabroom rounds...</option>
                    }
                </select>
            </form>
        </div>
    );
};

export default TabroomRoundsDropdown;
