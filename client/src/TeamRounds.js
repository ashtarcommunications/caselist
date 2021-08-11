import React, { useEffect, useState } from 'react';
import { loadRounds } from './api';

function TeamRounds() {
    const [rounds, setRounds] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setRounds(await loadRounds('ndtceda21', 'Northwestern', 'NorthwesternXaXb'));
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="roundlist">
            <h2>Rounds</h2>
            <table>
                <tbody>
                    <th>Side</th>
                    <th>Tournament</th>
                    <th>Round</th>
                    <th>Opponent</th>
                    <th>Judge</th>
                    <th>Cites</th>
                    <th>Round Report</th>
                    {
                        rounds.map(r => {
                            return (
                                <tr key={r.round_id}>
                                    <td>{r.side}</td>
                                    <td>{r.tournament}</td>
                                    <td>{r.round}</td>
                                    <td>{r.opponent}</td>
                                    <td>{r.judge}</td>
                                    <td>{r.cites}</td>
                                    <td>{r.report}</td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        </div>
    );
}

export default TeamRounds;
