import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faAngleDown, faAngleUp, faCalendarAlt, faFileDownload, faVideo } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { displaySide, normalizeSide, roundName } from '@speechanddebate/nsda-js-utils';

import { loadRounds, deleteRound } from '../helpers/api';
import ConfirmButton from '../helpers/ConfirmButton';
import { useDeviceDetect } from '../helpers/mobile';
import Table from '../tables/Table';

import styles from './TeamRounds.module.css';

const RoundsTable = ({ loading, event, archived }) => {
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
            toast.error(`Failed to delete round: ${err.message}`);
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
        {
            id: 'created_at',
            accessor: 'created_at',
        },
        {
            Header: (row) => {
                return (
                    <>
                        <span>Tournament</span>
                        <FontAwesomeIcon
                            icon={faCalendarAlt}
                            title="Sort by date"
                            className={styles.calendar}
                            onClick={() => row.toggleSortBy('created_at')}
                        />
                    </>
                );
            },
            accessor: 'tournament',
            Cell: (row) => {
                const createdAt = moment(row.row?.original?.created_at).format('l');
                return <span title={`Created ${createdAt}`}>{row.value}</span>;
            },
        },
        {
            Header: 'Round',
            width: '75px',
            accessor: 'round',
            Cell: (row) => {
                const createdAt = moment(row.row?.original?.created_at).format('l');
                return <span title={`Created ${createdAt}`}>{roundName(row.value)}</span>;
            },
        },
        {
            Header: 'Side',
            width: '50px',
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
        {
            id: 'opensource',
            Header: 'Open Source',
            width: '100px',
            accessor: row => row,
            disableSortBy: true,
            disableFilters: true,
            className: styles.center,
            Cell: (row) => {
                return (
                    <>
                        {
                            row.row?.original?.opensource &&
                            <FontAwesomeIcon
                                icon={faFileDownload}
                                title="Download"
                                className={styles.download}
                            />
                        }
                        {
                            row.row?.original?.video &&
                            <a href={row.row?.original?.video} target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon
                                    icon={faVideo}
                                    title="Video"
                                    className={styles.video}
                                />
                            </a>
                        }
                    </>
                );
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
                !archived &&
                <FontAwesomeIcon
                    className={styles.trash}
                    title="Delete round"
                    icon={faTrash}
                    id={row.value?.round_id}
                    onClick={e => handleDeleteRoundConfirm(e)}
                />
            ),
        },
    ], [
        handleToggleReport,
        handleToggleAll,
        allRoundsOpen,
        handleDeleteRoundConfirm,
        event,
        archived,
    ]);

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
                            {
                                !archived && <FontAwesomeIcon
                                    className={styles.trash}
                                    icon={faTrash}
                                    id={row.row?.original?.round_id}
                                    onClick={e => handleDeleteRoundConfirm(e)}
                                />
                            }
                        </p>
                        <p>Side: {row.row?.original?.side}</p>
                        <p>Opponent: {row.row?.original?.opponent}</p>
                        <p>Judge: {row.row?.original?.judge}</p>
                        {
                            row.row?.original?.opensource &&
                            <p>
                                <span>Open Source:</span>
                                <FontAwesomeIcon
                                    icon={faFileDownload}
                                    className={styles.save}
                                />
                            </p>
                        }
                        {
                            row.row?.original?.video &&
                            <p>
                                <span>Video:</span>
                                <a href={row.row?.original?.video} target="_blank" rel="noopener noreferrer">
                                    <FontAwesomeIcon
                                        icon={faVideo}
                                        title="Video"
                                        className={styles.video}
                                    />
                                </a>
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
    ], [handleDeleteRoundConfirm, archived]);

    const { isMobile } = useDeviceDetect();

    return (
        <Table
            columns={isMobile ? mobileColumns : columns}
            data={rounds}
            hiddenColumns={['created_at']}
            className={`${styles['rounds-table']} ${isMobile ? styles['mobile-table'] : undefined}`}
            noDataText="No rounds found"
            loading={loading}
        />
    );
};

export default RoundsTable;
