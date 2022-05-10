import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faAngleDown, faAngleUp, faCopy } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import { roundName, displaySide } from '@speechanddebate/nsda-js-utils';

import { loadCites, deleteCite } from '../helpers/api';
import ConfirmButton from '../helpers/ConfirmButton';
import { useDeviceDetect } from '../helpers/mobile';
import Table from '../tables/Table';

import styles from './TeamRounds.module.css';

const CitesTable = ({ loading, event, archived }) => {
    const { caselist, school, team, side } = useParams();

    const [cites, setCites] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await loadCites(caselist, school, team);
                setCites(side ? response.filter(r => r.side === side) : response);
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, [caselist, school, team, side]);

    const handleDeleteCite = useCallback(async (id) => {
        try {
            const response = await deleteCite(caselist, school, team, parseInt(id));
            toast.success(response.message);
            setCites(cites.filter(c => c.cite_id !== parseInt(id)));
        } catch (err) {
            console.log(err);
        }
    }, [caselist, school, team, cites]);

    const handleDeleteCiteConfirm = useCallback((e) => {
        const id = e.currentTarget.id;
        if (!id) { return false; }
        toast(<ConfirmButton
            message="Are you sure you want to delete this cite entry?"
            handler={() => handleDeleteCite(id)}
        />);
    }, [handleDeleteCite]);

    const handleToggleCites = useCallback((e) => {
        const newCites = [...cites];
        newCites.forEach(c => {
            if (c.cite_id === parseInt(e.currentTarget.id)) {
                c.citesopen = !c.citesopen;
            }
        });
        setCites(newCites);
    }, [cites]);

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

    const citeHeaders = useMemo(() => {
        return [
            {
                id: 'cites',
                width: 'auto',
                Header: 'Cites',
                accessor: row => row,
                className: styles.cites,
                Cell: (row) => {
                    return (
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
                                className={`cites ${row.row?.original?.citesopen ? styles.citesopen : styles.citesclosed}`}
                            >
                                <Markdown>{row.value?.cites}</Markdown>
                            </span>
                        </div>
                    );
                },
            },
            {
                id: 'copy',
                width: '25px',
                maxWidth: '25px',
                disableSortBy: true,
                accessor: (row) => row,
                className: styles.center,
                Cell: (row) => (
                    <span
                        id={row.row?.original?.cite_id}
                        onClick={() => handleCopyCites(row.row?.original?.cite_id)}
                        className={styles.copy}
                        title="Copy cites"
                    >
                        <FontAwesomeIcon
                            icon={faCopy}
                        />
                    </span>
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
                    <span
                        id={row.row?.original?.cite_id}
                        onClick={e => handleDeleteCiteConfirm(e)}
                        className={styles.trash}
                        title="Delete cites"
                    >
                        <FontAwesomeIcon
                            icon={faTrash}
                        />
                    </span>
                ),
            },
        ];
    }, [handleToggleCites, handleCopyCites, handleDeleteCiteConfirm, event, archived]);

    const { isMobile } = useDeviceDetect();

    return (
        <Table
            columns={citeHeaders}
            data={cites}
            className={`${styles['cites-table']} ${isMobile ? styles['mobile-table'] : undefined}`}
            noDataText="No cites found!"
            loading={loading}
            filterable={false}
        />
    );
};

export default CitesTable;
