import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { loadTeams } from './api';
import Table from './Table';
import './TeamList.css';

const TeamList = () => {
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

    const handleDelete = (e) => {
        console.log(e.currentTarget.id);
        alert('You sure yo');
    };

    const data = useMemo(() => teams, [teams]);
    const columns = useMemo(() => [
        {
            Header: 'Team',
            accessor: 'name',
            Cell: (row) => { return <Link to="/rounds">{row.value}</Link>; },
        },
        { Header: 'Code', accessor: 'code' },
        { Header: 'Aff', accessor: null },
        { Header: 'Neg', accessor: null },
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
        <div className="teamlist">
            <h1>Northwestern</h1>
            <hr />
            <Table columns={columns} data={data} />
        </div>
    );
};

export default TeamList;
