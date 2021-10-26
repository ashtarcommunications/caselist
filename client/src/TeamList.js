import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faLink } from '@fortawesome/free-solid-svg-icons';
import { loadTeams, loadSchool, deleteTeam } from './api';
import Table from './Table';
import './TeamList.css';

const TeamList = () => {
    const { caselist, school } = useParams();

    const [schoolData, setSchoolData] = useState({});
    useEffect(() => {
        const fetchData = async () => {
            try {
                setSchoolData(await loadSchool(caselist, school));
            } catch (err) {
                setSchoolData({});
                console.log(err);
            }
        };
        fetchData();
    }, [caselist, school]);

    const [teams, setTeams] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setTeams(await loadTeams(caselist, school));
            } catch (err) {
                setTeams([]);
                console.log(err);
            }
        };
        fetchData();
    }, [caselist, school]);

    const handleDelete = async (e) => {
        // eslint-disable-next-line no-alert
        alert(`Deleting team ${e.currentTarget.dataset.code}`);
        try {
            await deleteTeam(caselist, school, e.currentTarget.dataset.code);
        } catch (err) {
            console.log(err);
        }
    };

    const handleLink = (e) => {
        e.preventDefault();
        return false;
    };

    const data = useMemo(() => teams, [teams]);
    const columns = useMemo(() => [
        {
            Header: 'Team',
            accessor: row => row,
            Cell: (row) => {
                return (
                    <Link to={`/${caselist}/${school}/${row.value?.code}`}>
                        {row.value.name} (
                        <span>{row.value.debater1_first} </span>
                        <span>{row.value.debater1_last} </span>
                        <span>- </span>
                        <span>{row.value.debater2_first} </span>
                        <span>{row.value.debater2_last}</span>
                        )
                    </Link>
                );
            },
        },
        {
            id: 'delete',
            Header: '',
            accessor: (row) => row,
            className: 'center',
            Cell: (row) => (
                <FontAwesomeIcon
                    className="trash"
                    icon={faTrash}
                    data-code={row.value?.code}
                    onClick={e => handleDelete(e)}
                />
            ),
        },
    ], [caselist, school, handleDelete]);

    return (
        <div className="teamlist">
            <h1>{schoolData.display_name}</h1>
            <hr />
            <Table columns={columns} data={data} />
            {
                schoolData.chapter_id
                ? <p>Linked to Tabroom chapter #{schoolData.chapter_id}</p>
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
