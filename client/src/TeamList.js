import React, { useEffect, useState, useMemo } from 'react';
import { loadTeams } from './api';
import Table from './Table';
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

    const data = useMemo(() => teams, [teams]);
    const columns = useMemo(() => [
        { Header: 'Team', accessor: 'name' },
        { Header: 'Code', accessor: 'code' },
        { Header: 'Aff', accessor: null },
        { Header: 'Neg', accessor: null },
    ], []);

    return (
        <div className="teamlist">
            <h1>Northwestern</h1>
            <hr />
            <Table columns={columns} data={data} />
        </div>
    );
}

export default TeamList;
