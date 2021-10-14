import React, { useEffect, useState, useMemo } from 'react';
import { loadRounds } from './api';
import Table from './Table';

const TeamRounds = () => {
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

    const data = useMemo(() => rounds, [rounds]);
    const columns = useMemo(() => [
        { Header: 'Side', accessor: 'side' },
        { Header: 'Tournament', accessor: 'tournament' },
        { Header: 'Round', accessor: 'round' },
        { Header: 'Opponent', accessor: 'opponent' },
        { Header: 'Judge', accessor: 'judge' },
        { Header: 'Cites', accessor: 'cites' },
        { Header: 'Round Report', accessor: 'report' },
    ], []);

    return (
        <div className="roundlist">
            <h2>Rounds</h2>
            <Table columns={columns} data={data} />
        </div>
    );
};

export default TeamRounds;
