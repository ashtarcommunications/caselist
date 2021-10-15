import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faLink } from '@fortawesome/free-solid-svg-icons';
import { loadTeams, loadSchool } from './api';
import Table from './Table';
import './TeamList.css';

const TeamList = () => {
    const [school, setSchool] = useState({});
    useEffect(() => {
        const fetchData = async () => {
            try {
                setSchool(await loadSchool('ndtceda21', 'Northwestern'));
            } catch (err) {
                setSchool({});
                console.log(err);
            }
        };
        fetchData();
    }, []);

    const [teams, setTeams] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setTeams(await loadTeams('ndtceda21', 'Northwestern'));
            } catch (err) {
                setTeams([]);
                console.log(err);
            }
        };
        fetchData();
    }, []);

    const handleDelete = (e) => {
        console.log(e.currentTarget.id);
        alert('You sure yo');
    };

    const handleLink = (e) => {
        e.preventDefault();
        return false;
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
            <h1>{school.display_name}</h1>
            <hr />
            <Table columns={columns} data={data} />
            {
                school.chapter_id
                ? <p>Linked to Tabroom chapter #{school.chapter_id}</p>
                : (
                    <p>
                        Link to Tabroom
                        <FontAwesomeIcon
                            className="link"
                            icon={faLink}
                            onClick={e => handleLink(e)}
                        />
                    </p>
                )
            }
        </div>
    );
};

export default TeamList;
