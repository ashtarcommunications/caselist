import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faAngleDown, faAngleUp, faCopy, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import Markdown from 'react-markdown';
import moment from 'moment';
import { roundName, displaySide } from '@speechanddebate/nsda-js-utils';

import { useDeviceDetect } from '../helpers/mobile';
import { useAuth } from '../helpers/auth';

import Table from '../tables/Table';

import styles from './CitesTable.module.css';

const CiteCell = ({ row, event, handleToggleCites }) => {
    const createdAt = moment(row.row?.original?.created_at).format('l');
    return (
        <div className={styles.cites}>
            {
                row.row?.original?.citesopen && row.row?.original?.tournament &&
                <p title={`Created ${createdAt}`} className={styles.roundinfo}>
                    <span>{row.row?.original?.tournament}</span>
                    <span> | </span>
                    <span>{roundName(row.row?.original?.round)}</span>
                    <span> | </span>
                    <span>{displaySide(row.row?.original?.side, event)}</span>
                    {row.row?.original?.opponent && <span> vs {row.row?.original?.opponent}</span>}
                    {row.row?.original?.judge && <span> | {row.row?.original?.judge}</span>}
                </p>
            }
            <h1
                title={`Created ${createdAt}`}
                onClick={e => handleToggleCites(e)}
                id={row.row?.original?.cite_id}
            >
                <span>{row.value?.title}</span>
                <span className={styles.caret}>
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
                className={`cites ${!row.row?.original?.citesopen && styles.citesclosed}`}
            >
                <Markdown>{row.value?.cites}</Markdown>
            </span>
        </div>
    );
};

CiteCell.propTypes = {
    row: PropTypes.object,
    event: PropTypes.string,
    handleToggleCites: PropTypes.func,
};

const CitesTable = ({
    loading = false,
    event,
    archived = false,
    cites = [],
    handleDeleteCiteConfirm,
    handleToggleCites,
}) => {
    const auth = useAuth();
    const { isMobile } = useDeviceDetect();

    const handleCopyCites = useCallback(async (id) => {
        const cite = cites.find(c => c.cite_id === parseInt(id));
        const citeContent = `${cite.title}\n${cite.cites}`;
        try {
            await navigator.clipboard.writeText(citeContent);
            toast.success('Cites copied to clipboard');
        } catch (err) {
            console.log(err);
        }
    }, [cites]);

    const columns = useMemo(() => {
        return [
            {
                id: 'created_at',
                accessor: 'created_at',
            },
            {
                id: 'cites',
                width: 'auto',
                accessor: row => row,
                className: styles.cites,
                Header: (row) => {
                    return (
                        <>
                            <span>Cites</span>
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
                Cell: (row) => (
                    <CiteCell row={row} event={event} handleToggleCites={handleToggleCites} />
                ),
            },
            {
                id: 'copy',
                width: '25px',
                maxWidth: '25px',
                disableSortBy: true,
                accessor: (row) => row,
                className: styles.center,
                Cell: (row) => (
                    <FontAwesomeIcon
                        icon={faCopy}
                        id={row.row?.original?.cite_id}
                        onClick={() => handleCopyCites(row.row?.original?.cite_id)}
                        className={styles.copy}
                        data-testid="copy"
                        title="Copy cites"
                    />
                ),
            },
            {
                id: 'delete',
                width: '25px',
                disableSortBy: true,
                accessor: (row) => row,
                className: styles.center,
                Cell: (row) => (
                    auth.user?.trusted && !archived ?
                        <FontAwesomeIcon
                            icon={faTrash}
                            id={row.row?.original?.cite_id}
                            onClick={e => handleDeleteCiteConfirm(e)}
                            className={styles.trash}
                            data-testid="trash-cite"
                            title="Delete cites"
                        />
                    : null
                ),
            },
        ];
    }, [handleToggleCites, handleCopyCites, handleDeleteCiteConfirm, event, archived]);

    const mobileColumns = useMemo(() => [
        {
            id: 'mobile',
            Header: 'Cites',
            disableSortBy: true,
            disableFilters: true,
            accessor: row => row,
            Cell: (row) => (
                <>
                    <CiteCell row={row} event={event} handleToggleCites={handleToggleCites} />
                    {
                        !archived &&
                        <FontAwesomeIcon
                            icon={faTrash}
                            id={row.row?.original?.cite_id}
                            onClick={e => handleDeleteCiteConfirm(e)}
                            className={styles.trash}
                            title="Delete cites"
                        />
                    }
                </>
            ),
        },
    ], [handleToggleCites, handleDeleteCiteConfirm, archived, event]);

    if (cites.length === 0) { return false; }

    return (
        <Table
            columns={isMobile ? mobileColumns : columns}
            data={cites}
            hiddenColumns={['created_at']}
            className={`${styles['cites-table']} ${isMobile && styles.mobile}`}
            noDataText="No cites found!"
            loading={loading}
            filterable={false}
        />
    );
};

CitesTable.propTypes = {
    loading: PropTypes.bool,
    event: PropTypes.string,
    archived: PropTypes.bool,
    cites: PropTypes.array,
    handleDeleteCiteConfirm: PropTypes.func,
    handleToggleCites: PropTypes.func,

};

export default CitesTable;
