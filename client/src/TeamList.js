import React, { useEffect, useState } from 'react';
import { loadTeams } from './api';
import './TeamList.css';

function TeamList() {
    const [teams, setTeams] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setTeams(await loadTeams('ndtceda21', 'Northwestern'));
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="teamlist">
            <h2>Northwestern</h2>
            <table>
                <tbody>
                    <th>Team</th><th>Code</th><th>Aff</th><th>Neg</th>
                    {
                        teams.map(t => {
                            return (
                                <tr key={t.team_id}>
                                    <td>{t.name}</td>
                                    <td>{t.code}</td>
                                    <td>Aff</td>
                                    <td>Neg</td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        </div>
    );
}

export default TeamList;
