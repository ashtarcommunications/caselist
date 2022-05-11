import React, { useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faAngleDown, faAngleUp, faCopy } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import Markdown from 'react-markdown';
import { roundName, displaySide } from '@speechanddebate/nsda-js-utils';

import { useDeviceDetect } from '../helpers/mobile';
import Table from '../tables/Table';

import styles from './CitesTable.module.css';

const CiteCell = ({ row, event, handleToggleCites }) => (
    <div className={styles.cites}>
        {
            row.row?.original?.citesopen && row.row?.original?.tournament &&
            <p className={styles.roundinfo}>
                <span>{row.row?.original?.tournament}</span>
                <span> | </span>
                <span>{roundName(row.row?.original?.round)}</span>
                <span> | </span>
                <span>{displaySide(row.row?.original?.side, event)}</span>
                <span> vs {row.row?.original?.opponent}</span>
                <span> | </span>
                <span>{row.row?.original?.judge}</span>
            </p>
        }
        <h1
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

const CitesTable = ({
    loading,
    event,
    archived,
    cites = [],
    handleDeleteCiteConfirm,
    handleToggleCites,
}) => {
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
                id: 'cites',
                width: 'auto',
                Header: 'Cites',
                accessor: row => row,
                className: styles.cites,
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
                    !archived &&
                    <FontAwesomeIcon
                        icon={faTrash}
                        id={row.row?.original?.cite_id}
                        onClick={e => handleDeleteCiteConfirm(e)}
                        className={styles.trash}
                        title="Delete cites"
                    />
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

    return (
        <Table
            columns={isMobile ? mobileColumns : columns}
            data={cites}
            className={`${styles['cites-table']} ${isMobile && styles.mobile}`}
            noDataText="No cites found!"
            loading={loading}
            filterable={false}
        />
    );
};

export default CitesTable;
