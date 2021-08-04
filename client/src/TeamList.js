import React, { useEffect, useState } from 'react';
import './TeamList.css';

const loadTeams = async () => {
    const response = await fetch(
        'http://localhost:10010/v1/ndtceda21/schools/Northwestern/teams',
        { headers: { 'Content-Type': 'application/json' } },
    );
    return response.json();
};

function TeamList() {
    const [teams, setTeams] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setTeams(await loadTeams());
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="teamlist">
            <ul>
                {
                    teams.map(t => {
                        return <li key={t.team_id}>{t.name}</li>;
                    })
                }
            </ul>
        </div>
    );
}

export default TeamList;
