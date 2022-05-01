import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheck, faAngleDown, faAngleUp, faSave } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { loadRounds, deleteRound } from '../helpers/api';
import Table from '../tables/Table';
import ConfirmButton from '../helpers/ConfirmButton';
import { useDeviceDetect } from '../helpers/common';
import './TeamRounds.css';

const RoundsTable = ({ loading }) => {
    const { caselist, school, team, side } = useParams();

    const [rounds, setRounds] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await loadRounds(caselist, school, team);
                setRounds(side ? response.filter(r => r.side === side) : response);
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

    const handleDeleteRoundConfirm = useCallback((e) => {
        toast(<ConfirmButton
            message="Are you sure you want to delete this round and all linked cites?"
            handler={handleDeleteRound(e.currentTarget.id)}
        />);
    }, [handleDeleteRound]);

    const handleToggleReport = useCallback((e) => {
        const newRounds = [...rounds];
        newRounds.forEach(r => {
            if (r.round_id === parseInt(e.currentTarget.id)) {
                r.reportopen = !r.reportopen;
            }
        });
        setRounds(newRounds);
    }, [rounds]);

    const allRoundsOpen = rounds?.filter(r => r.reportopen).length === rounds.length;

    const handleToggleAll = useCallback(() => {
        const newRounds = [...rounds];
        newRounds.forEach(r => {
            r.reportopen = !allRoundsOpen;
        });
        setRounds(newRounds);
    }, [allRoundsOpen, rounds]);

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
                            className="pure-button toggleall"
                            onClick={handleToggleAll}
                        >
                            {allRoundsOpen ? 'Collapse All' : 'Expand All'}
                        </button>
                    </>
                );
            },
            disableSortBy: true,
            accessor: row => row,
            Cell: (row) => {
                return (
                    <div className="report">
                        <div
                            className={row.row?.original?.reportopen ? 'report reportopen' : 'report reportclosed'}
                        >
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
            disableSortBy: true,
            accessor: (row) => row,
            className: 'center',
            Cell: (row) => (
                <FontAwesomeIcon
                    className="trash"
                    icon={faTrash}
                    id={row.value?.round_id}
                    onClick={e => handleDeleteRoundConfirm(e)}
                />
            ),
        },
    ], [handleToggleReport, handleToggleAll, allRoundsOpen, handleDeleteRoundConfirm]);

    const mobileColumns = useMemo(() => [
        {
            id: 'mobile',
            Header: 'Rounds',
            disableSortBy: true,
            accessor: row => row,
            Cell: (row) => {
                return (
                    <div>
                        <p>Tournament: {row.row?.original?.tournament}</p>
                        <p>
                            <span>Round: {row.row?.original?.round}</span>
                            <FontAwesomeIcon
                                className="trash"
                                icon={faTrash}
                                id={row.row?.original?.round_id}
                                onClick={e => handleDeleteRoundConfirm(e)}
                            />
                        </p>
                        <p>Side: {row.row?.original?.side}</p>
                        <p>Opponent: {row.row?.original?.opponent}</p>
                        <p>Judge: {row.row?.original?.judge}</p>
                        {
                            row.row?.original?.opensource &&
                            <p>
                                <span>Open Source:</span>
                                <FontAwesomeIcon
                                    icon={faSave}
                                    className="save"
                                />
                            </p>
                        }
                        {
                            row.row?.original?.report &&
                            <p className="report reportopen">Report:<br />{row.row?.original?.report}</p>
                        }
                    </div>
                );
            },
        },
    ], [handleDeleteRoundConfirm]);

    const { isMobile } = useDeviceDetect();

    return (
        <Table columns={isMobile ? mobileColumns : columns} data={rounds} className={isMobile ? 'rounds-table mobile-table' : 'rounds-table'} loading={loading} />
    );
};

export default RoundsTable;
