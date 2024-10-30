import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { displaySide, roundName } from '@speechanddebate/nsda-js-utils';

import { useDeviceDetect } from '../helpers/mobile';

import Table from '../tables/Table';

import styles from './RoundsTable.module.css';

// The reason I'm putting this in a separate file rather than just reusing rounds table is because
// I think that in the future this can probably be adapted more.

const DeletedRoundsTable = ({
    loading = false,
    event,
    archived = false,
    rounds = [],
    handleToggleAll,
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
                            data-testid="calendar"
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
            Header: 'Deleted At',
            accessor: 'updated_at',
            Cell: (row) => {
                const vals = row.value.split(' ');
                return <span>{new Date(`${vals[0]}T${vals[1]}Z`).toLocaleString()}</span>;
            },
        },
    ], [
        handleToggleAll,
        allRoundsOpen,
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
                        </p>
                        <p>Side: {row.row?.original?.side}</p>
                        <p>Opponent: {row.row?.original?.opponent}</p>
                        <p>Judge: {row.row?.original?.judge}</p>
                    </div>
                );
            },
        },
    ], [archived, caselist, school, team]);

    return (
        <Table
            columns={isMobile ? mobileColumns : columns}
            data={rounds}
            hiddenColumns={['created_at']}
            className={`${styles['rounds-table']} ${isMobile && styles.mobile}`}
            noDataText="This team does not currently have any deleted rounds!"
            loading={loading}
        />
    );
};

DeletedRoundsTable.propTypes = {
    loading: PropTypes.bool,
    event: PropTypes.string,
    archived: PropTypes.bool,
    rounds: PropTypes.array,
    handleToggleAll: PropTypes.func,
    allRoundsOpen: PropTypes.bool,

};

export default DeletedRoundsTable;
