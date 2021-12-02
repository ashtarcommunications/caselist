import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheck, faLink, faAngleDown, faAngleUp, faSave } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { Link, useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import { loadRounds, addTabroomTeamLink } from './api';
import Table from './Table';
import './TeamRounds.css';

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
    const ConfirmButton = () => (
        <div>
            Are you sure you want to link this page to your Tabroom account?
            <button
                type="button"
                className="pure-button pure-button-primary"
                onClick={handleLinkPage}
            >
                Confirm
            </button>
        </div>
    );
    const handleShowConfirm = async () => {
        try {
            toast(<ConfirmButton />);
        } catch (err) {
            console.log(err);
        }
    };

    const handleToggleReport = useCallback((e) => {
        const newRounds = [...rounds];
        newRounds.forEach(r => {
            if (r.round_id === parseInt(e.currentTarget.id)) {
                r.reportopen = !r.reportopen;
            }
        });
        setRounds(newRounds);
    }, [rounds]);

    const allRoundsOpen = rounds.filter(r => r.reportopen).length === rounds.length;

    const handleToggleAll = useCallback(() => {
        const newRounds = [...rounds];
        newRounds.forEach(r => {
            r.reportopen = !allRoundsOpen;
        });
        setRounds(newRounds);
    }, [allRoundsOpen, rounds]);

    const data = useMemo(() => {
        return side
        ? rounds.filter(r => r.side === side)
        : rounds;
    }, [rounds, side]);

    const columns = useMemo(() => [
        { Header: 'Tournament', accessor: 'tournament' },
        { Header: 'Side', accessor: 'side' },
        { Header: 'Round', accessor: 'round' },
        { Header: 'Opponent', accessor: 'opponent' },
        { Header: 'Judge', accessor: 'judge' },
        {
            id: 'cites',
            Header: 'Cites',
            accessor: 'cites',
            className: 'center',
            Cell: (row) => {
                return row.value && <FontAwesomeIcon
                    icon={faCheck}
                />;
            },
        },
        {
            id: 'opensource',
            Header: 'Open Source',
            accessor: row => row,
            className: 'center',
            Cell: () => {
                return (<FontAwesomeIcon
                    icon={faSave}
                />);
            },
        },
        {
            id: 'report',
            Header: () => {
                return (
                    <>
                        <span className="report-header">Round Report</span>
                        <button
                            type="button"
                            className="pure-button pure-button-primary toggleall"
                            onClick={handleToggleAll}
                        >
                            {allRoundsOpen ? 'Collapse All' : 'Expand All'}
                        </button>
                    </>
                );
            },
            accessor: row => row,
            Cell: (row) => {
                return (
                    <div className="report">
                        <p className={row.row?.original?.reportopen ? 'report reportopen' : 'report reportclosed'}>
                            {row.value?.report}
                        </p>
                        <span className="caret">
                            <FontAwesomeIcon
                                icon={
                                    row.row?.original?.reportopen
                                    ? faAngleDown
                                    : faAngleUp
                                }
                                id={row.row?.original?.round_id}
                                onClick={e => handleToggleReport(e)}
                            />
                        </span>
                    </div>
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
                    id={row.value?.round_id}
                    onClick={e => handleDelete(e)}
                />
            ),
        },
    ], [handleToggleReport, handleToggleAll, allRoundsOpen]);

    const citeHeaders = useMemo(() => {
        return [
            {
                id: 'cites',
                Header: 'Cites',
                accessor: 'cites',
                className: 'cites',
                Cell: (row) => (
                    <Markdown>{row.value}</Markdown>
                ),
            },
        ];
    }, []);

    return (
        <div className="roundlist">
            <h2>
                {school} {team}
                <FontAwesomeIcon
                    icon={faLink}
                    onClick={handleShowConfirm}
                />
            </h2>
            <Link to={`/${caselist}/${school}/${team}/Aff`}>
                <button type="button" className="pure-button pure-button-primary aff">Aff</button>
            </Link>
            <Link to={`/${caselist}/${school}/${team}/Neg`}>
                <button type="button" className="pure-button pure-button-primary neg">Neg</button>
            </Link>
            <Link to={`/${caselist}/${school}/${team}`}>
                <button type="button" className="pure-button pure-button-primary both">Both</button>
            </Link>
            <Link to={`/${caselist}/${school}/${team}/add`}>
                <button type="button" className="pure-button pure-button-primary add">+ Add Round</button>
            </Link>
            <Table columns={columns} data={data} />
            <Table columns={citeHeaders} data={data} />
        </div>
    );
};

export default TeamRounds;
