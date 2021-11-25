import React, { useEffect, useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { loadRounds, addTabroomTeamLink } from './api';
import Table from './Table';
import './TeamRounds.css';

const TeamRounds = () => {
    const { caselist, school, team, side } = useParams();

    const [rounds, setRounds] = useState([]);
    const [selectedSide, setSelectedSide] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setRounds(await loadRounds(caselist, school, team));
                if (side) { setSelectedSide(side); }
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, [caselist, school, team, side]);

    const handleChangeSide = (e) => {
        setSelectedSide(e.currentTarget.value);
    };

    const handleDelete = (e) => {
        // eslint-disable-next-line no-alert
        alert(`Deleting ${e.currentTarget.id}`);
    };

    const handleLinkPage = async () => {
        try {
            const response = await addTabroomTeamLink(window.location.pathname);
            toast.success(response.message);
        } catch (err) {
            console.log(err);
        }
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
        {
            id: 'report',
            Header: 'Round Report',
            accessor: 'report',
            className: 'report',
            Cell: (row) => (
                <p className="report">{row.value}</p>
            ),
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
                    id={row.value?.team_id}
                    onClick={e => handleDelete(e)}
                />
            ),
        },
    ], []);

    return (
        <div className="roundlist">
            <h2>{team}</h2>
            <button type="button" className="pure-button pure-button-primary" onClick={handleLinkPage}>Link</button>
            <button type="button" className="pure-button pure-button-primary" onClick={handleChangeSide} value="Aff">Aff</button>
            <button type="button" className="pure-button pure-button-primary" onClick={handleChangeSide} value="Neg">Neg</button>
            <button type="button" className="pure-button pure-button-primary" onClick={handleChangeSide} value="">Both</button>
            <Table columns={columns} data={data} />
        </div>
    );
};

export default TeamRounds;
