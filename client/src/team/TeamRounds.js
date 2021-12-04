import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheck, faLink, faAngleDown, faAngleUp, faSave, faCopy } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import moment from 'moment';
import { Link, useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import { loadRounds, loadTeam, addTabroomTeamLink, deleteRound } from '../helpers/api';
import Table from '../tables/Table';
import './TeamRounds.css';

const TeamRounds = () => {
    const { caselist, school, team, side } = useParams();

    const [rounds, setRounds] = useState([]);
    const [cites, setCites] = useState([]);

    const [teamData, setTeamData] = useState({});
    useEffect(() => {
        const fetchData = async () => {
            try {
                setTeamData(await loadTeam(caselist, school, team));
            } catch (err) {
                setTeamData({});
                console.log(err);
            }
        };
        fetchData();
    }, [caselist, school, team]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await loadRounds(caselist, school, team);
                setRounds(side ? response.filter(r => r.side === side) : response);
                const newCites = [];
                response.forEach(r => {
                    const roundcites = JSON.parse(r.cites) || [];
                    roundcites.forEach(c => { newCites.push({ ...c, round_id: r.round_id }); });
                });
                setCites(newCites);
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, [caselist, school, team, side]);

    const handleDeleteRound = useCallback(async (id) => {
        try {
            const response = await deleteRound(caselist, school, team, id);
            toast.success(response.message);
        } catch (err) {
            console.log(err);
        }
    }, [caselist, school, team]);

    const handleDelete = useCallback((e) => {
        toast(<ConfirmButton
            message="Are you sure you want to delete this round and all linked cites?"
            handler={handleDeleteRound(e.currentTarget.id)}
        />);
    }, [handleDeleteRound]);

    const handleLinkPage = async () => {
        try {
            const response = await addTabroomTeamLink(window.location.pathname);
            toast.success(response.message);
        } catch (err) {
            console.log(err);
        }
    };
    const ConfirmButton = ({ message = 'Are you sure?', handler }) => (
        <div>
            <span>{message}</span>
            <button
                type="button"
                className="pure-button pure-button-primary"
                onClick={handler}
            >
                Confirm
            </button>
        </div>
    );
    const handleShowConfirm = async () => {
        toast(<ConfirmButton
            message="Are you sure you want to link this page to your Tabroom account?"
            handler={handleLinkPage}
        />);
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

    const allRoundsOpen = rounds || [].filter(r => r.reportopen).length === rounds.length;

    const handleToggleAll = useCallback(() => {
        const newRounds = [...rounds];
        newRounds.forEach(r => {
            r.reportopen = !allRoundsOpen;
        });
        setRounds(newRounds);
    }, [allRoundsOpen, rounds]);

    const handleToggleCites = useCallback((e) => {
        const newCites = [...cites];
        newCites.forEach(c => {
            if (c.round_id === parseInt(e.currentTarget.id)) {
                c.citesopen = !c.citesopen;
            }
        });
        setCites(newCites);
    }, [cites]);

    const handleCopyCites = useCallback((e) => {
        const round = rounds.find(r => r.round_id === parseInt(e.currentTarget.id));
        toast.success(round.cites);
    }, [rounds]);

    const columns = useMemo(() => [
        { Header: 'Tournament', accessor: 'tournament' },
        { Header: 'Round', accessor: 'round' },
        { Header: 'Side', accessor: 'side' },
        { Header: 'Opponent', accessor: 'opponent' },
        { Header: 'Judge', accessor: 'judge' },
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
                        <div className={row.row?.original?.reportopen ? 'report reportopen' : 'report reportclosed'}>
                            {row.value?.report}
                        </div>
                        {
                            row.value?.report &&
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
                        }
                    </div>
                );
            },
        },
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
            Header: () => <span>Open<br />Source</span>,
            accessor: row => row,
            className: 'center',
            Cell: () => {
                return (<FontAwesomeIcon
                    icon={faSave}
                    className="save"
                />);
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
    ], [handleToggleReport, handleToggleAll, allRoundsOpen, handleDelete]);

    const citeHeaders = useMemo(() => {
        return [
            {
                id: 'cites',
                Header: 'Cites',
                accessor: row => row,
                className: 'cites',
                Cell: (row) => {
                    return (
                        <div className="cites">
                            <h1
                                onClick={e => handleToggleCites(e)}
                                id={row.row?.original?.round_id}
                            >
                                <span>{row.value?.title}</span>
                                <span className="caret">
                                    <FontAwesomeIcon
                                        icon={
                                            row.row?.original?.citesopen
                                            ? faAngleDown
                                            : faAngleUp
                                        }
                                    />
                                </span>
                            </h1>
                            <span
                                className={row.row?.original?.citesopen ? 'cites citesopen' : 'cites citesclosed'}
                            >
                                <Markdown>{row.value?.cites}</Markdown>
                            </span>
                            <span className="copy">
                                <FontAwesomeIcon
                                    icon={faCopy}
                                    onClick={e => handleCopyCites(e)}
                                    id={row.row?.original?.round_id}
                                />
                            </span>
                        </div>
                    );
                },
            },
        ];
    }, [handleToggleCites, handleCopyCites]);

    const timestamp = moment(teamData.updated_at, 'YYYY-MM-DD HH:mm:ss').format('l');

    return (
        <div className="roundlist">
            <h2>
                {school} {team}
            </h2>
            <p className="timestamp">Last updated by {teamData.updated_by} on {timestamp}</p>
            <div className="buttons">
                <Link to={`/${caselist}/${school}/${team}/Aff`}>
                    <button type="button" className="pure-button pure-button-primary aff">Aff</button>
                </Link>
                <Link to={`/${caselist}/${school}/${team}/Neg`}>
                    <button type="button" className="pure-button pure-button-primary neg">Neg</button>
                </Link>
                <Link to={`/${caselist}/${school}/${team}`}>
                    <button type="button" className="pure-button pure-button-primary both">Both</button>
                </Link>
                <button type="button" className="pure-button pure-button-primary claim" onClick={handleShowConfirm}>
                    <FontAwesomeIcon
                        icon={faLink}
                    />
                    Claim Page
                </button>
                <Link to={`/${caselist}/${school}/${team}/add`}>
                    <button type="button" className="pure-button pure-button-primary add">+ Add Round</button>
                </Link>
            </div>
            <Table columns={columns} data={rounds} />
            <Table columns={citeHeaders} data={cites} />
        </div>
    );
};

export default TeamRounds;
