import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faAngleDown, faAngleUp, faCalendarAlt, faFileDownload, faVideo, faEdit } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { displaySide, roundName } from '@speechanddebate/nsda-js-utils';

import { useDeviceDetect } from '../helpers/mobile';
import Table from '../tables/Table';
import DownloadFile from '../helpers/DownloadFile';

import styles from './RoundsTable.module.css';

const RoundsTable = ({
    loading = false,
    event,
    archived = false,
    rounds = [],
    handleDeleteRoundConfirm,
    handleToggleAll,
    handleToggleReport,
    allRoundsOpen = false,
}) => {
    const { caselist, school, team } = useParams();
    const { isMobile } = useDeviceDetect();

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
                        {
                            rounds.length > 0 &&
                            <button
                                type="button"
                                className={`pure-button ${styles.toggleall}`}
                                onClick={handleToggleAll}
                            >
                                {allRoundsOpen ? 'Collapse All' : 'Expand All'}
                            </button>
                        }
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
                            <DownloadFile path={row.row?.original?.opensource} />
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
            width: '75px',
            disableSortBy: true,
            disableFilters: true,
            accessor: (row) => row,
            className: styles.center,
            Cell: (row) => (
                !archived &&
                <>
                    <Link to={`/${caselist}/${school}/${team}/edit/${row.row?.original?.round_id}`}>
                        <FontAwesomeIcon
                            className={styles.edit}
                            title="Edit round"
                            icon={faEdit}
                        />
                    </Link>
                    <FontAwesomeIcon
                        className={styles.trash}
                        title="Delete round"
                        icon={faTrash}
                        id={row.row?.original?.round_id}
                        onClick={e => handleDeleteRoundConfirm(e)}
                    />
                </>
            ),
        },
    ], [
        handleToggleReport,
        handleToggleAll,
        allRoundsOpen,
        handleDeleteRoundConfirm,
        event,
        archived,
        rounds,
        caselist,
        school,
        team,
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
                                !archived &&
                                <>
                                    <Link to={`/${caselist}/${school}/${team}/edit/${row.row?.original?.round_id}`}>
                                        <FontAwesomeIcon
                                            className={styles.edit}
                                            title="Edit round"
                                            icon={faEdit}
                                        />
                                    </Link>
                                    <FontAwesomeIcon
                                        className={styles.trash}
                                        icon={faTrash}
                                        id={row.row?.original?.round_id}
                                        onClick={e => handleDeleteRoundConfirm(e)}
                                    />
                                </>
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
                                    className={styles.download}
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
                            <p className={`${styles.report}`}>Report:<br />{row.row?.original?.report}</p>
                        }
                    </div>
                );
            },
        },
    ], [handleDeleteRoundConfirm, archived, caselist, school, team]);

    return (
        <Table
            columns={isMobile ? mobileColumns : columns}
            data={rounds}
            hiddenColumns={['created_at']}
            className={`${styles['rounds-table']} ${isMobile && styles.mobile}`}
            noDataText="No rounds found!"
            loading={loading}
        />
    );
};

RoundsTable.propTypes = {
    loading: PropTypes.bool,
    event: PropTypes.string,
    archived: PropTypes.bool,
    rounds: PropTypes.array,
    handleDeleteRoundConfirm: PropTypes.func,
    handleToggleAll: PropTypes.func,
    handleToggleReport: PropTypes.func,
    allRoundsOpen: PropTypes.bool,

};

export default RoundsTable;
