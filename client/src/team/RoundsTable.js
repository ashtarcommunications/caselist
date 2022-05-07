import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faAngleDown, faAngleUp, faSave } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

import { loadRounds, deleteRound } from '../helpers/api';
import ConfirmButton from '../helpers/ConfirmButton';
import { displaySide, normalizeSide, roundName, useDeviceDetect } from '../helpers/common';
import Table from '../tables/Table';

import styles from './TeamRounds.module.css';

const RoundsTable = ({ loading, event }) => {
    const { caselist, school, team, side } = useParams();

    const [rounds, setRounds] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await loadRounds(caselist, school, team);
                if (response) {
                    setRounds(
                        side
                        ? response.filter(r => r.side === normalizeSide(side))
                        : response
                    );
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, [caselist, school, team, side]);

    const handleDeleteRound = useCallback(async (id) => {
        try {
            const response = await deleteRound(caselist, school, team, parseInt(id));
            toast.success(response.message);
            setRounds(rounds.filter(r => r.round_id !== parseInt(id)));
        } catch (err) {
            console.log(err);
        }
    }, [caselist, school, team, rounds]);

    const handleDeleteRoundConfirm = useCallback((e) => {
        const id = e.currentTarget.id;
        if (!id) { return false; }
        const round = rounds.find(r => r.round_id === parseInt(id));
        toast(<ConfirmButton
            message={`Are you sure you want to delete ${round.tournament} ${roundName(round.round)} and all linked cites?`}
            handler={() => handleDeleteRound(id)}
        />);
    }, [handleDeleteRound, rounds]);

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
        {
            Header: 'Round',
            width: '75px',
            accessor: 'round',
            Cell: (row) => (
                <span>{roundName(row.value)}</span>
            ),
        },
        {
            Header: 'Side',
            width: '25px',
            accessor: row => displaySide(row.side),
            Cell: (row) => (
                <span>{displaySide(row.value, event)}</span>
            ),
        },
        { Header: 'Opponent', accessor: 'opponent', width: '150px' },
        { Header: 'Judge', accessor: 'judge' },
        {
            id: 'report',
            Header: () => {
                return (
                    <>
                        <span className={styles['report-header']}>Round Report</span>
                        <button
                            type="button"
                            className={`pure-button ${styles.toggleall}`}
                            onClick={handleToggleAll}
                        >
                            {allRoundsOpen ? 'Collapse All' : 'Expand All'}
                        </button>
                    </>
                );
            },
            disableSortBy: true,
            disableFilters: true,
            accessor: row => row,
            Cell: (row) => {
                return (
                    <div className={styles.report}>
                        <div
                            className={`${styles.report} ${row.row?.original?.reportopen ? styles.reportopen : styles.reportclosed}`}
                        >
                            {row.value?.report}
                        </div>
                        {
                            row.value?.report &&
                            <span className={styles.caret}>
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
        // {
        //     id: 'cites',
        //     Header: 'Cites',
        //     accessor: 'cites',
        //     className: styles.center,
        //     Cell: (row) => {
        //         return row.value && <FontAwesomeIcon
        //             icon={faCheck}
        //         />;
        //     },
        // },
        {
            id: 'opensource',
            width: '25px',
            accessor: row => row,
            disableSortBy: true,
            disableFilters: true,
            className: styles.center,
            Cell: () => {
                return (<FontAwesomeIcon
                    icon={faSave}
                    title="Download"
                    className={styles.save}
                />);
            },
        },
        {
            id: 'delete',
            width: '25px',
            disableSortBy: true,
            disableFilters: true,
            accessor: (row) => row,
            className: styles.center,
            Cell: (row) => (
                <FontAwesomeIcon
                    className={styles.trash}
                    title="Delete round"
                    icon={faTrash}
                    id={row.value?.round_id}
                    onClick={e => handleDeleteRoundConfirm(e)}
                />
            ),
        },
    ], [handleToggleReport, handleToggleAll, allRoundsOpen, handleDeleteRoundConfirm, event]);

    const mobileColumns = useMemo(() => [
        {
            id: 'mobile',
            Header: 'Rounds',
            disableSortBy: true,
            disableFilters: true,
            accessor: row => row,
            Cell: (row) => {
                return (
                    <div>
                        <p>Tournament: {row.row?.original?.tournament}</p>
                        <p>
                            <span>Round: {row.row?.original?.round}</span>
                            <FontAwesomeIcon
                                className={styles.trash}
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
                                    className={styles.save}
                                />
                            </p>
                        }
                        {
                            row.row?.original?.report &&
                            <p className={`${styles.report} ${styles.reportopen}`}>Report:<br />{row.row?.original?.report}</p>
                        }
                    </div>
                );
            },
        },
    ], [handleDeleteRoundConfirm]);

    const { isMobile } = useDeviceDetect();

    return (
        <Table
            columns={isMobile ? mobileColumns : columns}
            data={rounds}
            className={`${styles['rounds-table']} ${isMobile ? styles['mobile-table'] : undefined}`}
            noDataText="No rounds found"
            loading={loading}
        />
    );
};

export default RoundsTable;
