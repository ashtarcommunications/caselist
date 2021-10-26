import React, { useEffect, useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';
import { loadRounds } from './api';
import Table from './Table';

const TeamRounds = () => {
    const { caselist, school, team, side } = useParams();

    const [rounds, setRounds] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setRounds(await loadRounds(caselist, school, team));
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, [caselist, school, team]);

    const [selectedSide, setSelectedSide] = useState(null);

    const handleChangeSide = (e) => {
        setSelectedSide(e.currentTarget.value);
    };

    if (side) { setSelectedSide(side); }

    const handleDelete = (e) => {
        // eslint-disable-next-line no-alert
        alert(`Deleting ${e.currentTarget.id}`);
    };

    const data = useMemo(() => {
        return selectedSide
        ? rounds.filter(r => r.side === selectedSide)
        : rounds;
    }, [rounds, selectedSide]);

    const columns = useMemo(() => [
        { Header: 'Tournament', accessor: 'tournament' },
        { Header: 'Side', accessor: 'side' },
        { Header: 'Round', accessor: 'round' },
        { Header: 'Opponent', accessor: 'opponent' },
        { Header: 'Judge', accessor: 'judge' },
        { Header: 'Cites', accessor: 'cites' },
        { Header: 'Open Source', accessor: 'opensource' },
        { Header: 'Round Report', accessor: 'report' },
        {
            id: 'delete',
            Header: '',
            accessor: (row) => row,
            className: 'center',
            Cell: (row) => (
                <FontAwesomeIcon
                    className="trash"
                    icon={faTrash}
                    id={row.value?.team_id}
                    onClick={e => handleDelete(e)}
                />
            ),
        },
    ], []);

    return (
        <div className="roundlist">
            <h2>{team}</h2>
            <button type="button" className="pure-button pure-button-primary" onClick={handleChangeSide} value="Aff">Aff</button>
            <button type="button" className="pure-button pure-button-primary" onClick={handleChangeSide} value="Neg">Neg</button>
            <button type="button" className="pure-button pure-button-primary" onClick={handleChangeSide} value="">Both</button>
            <Table columns={columns} data={data} />
        </div>
    );
};

export default TeamRounds;
