import React from 'react';
import { useTable, useSortBy } from 'react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faSort } from '@fortawesome/free-solid-svg-icons';

import Loader from '../loader/Loader';

import styles from './Table.module.css';

const Table = ({ columns = [], data = [], className, loading = false, noDataText = 'No data found!' }) => {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data }, useSortBy);

    if (!columns || !data) return false;

    return (
        <div className={styles.table}>
            <table {...getTableProps()} className={`pure-table pure-table-bordered ${className}`}>
                <thead>
                    {
                        headerGroups.map(headerGroup => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {
                                    headerGroup.headers.map(column => (
                                        <th {...column.getHeaderProps()}>
                                            <div {...column.getSortByToggleProps()} data-testid="sortDiv">
                                                {column.render('Header')}
                                                {
                                                    column.isSorted ?
                                                        <FontAwesomeIcon
                                                            icon={
                                                                column.isSortedDesc
                                                                ? faAngleUp
                                                                : faAngleDown
                                                            }
                                                        />
                                                        :
                                                        !column.disableSortBy &&
                                                        <FontAwesomeIcon
                                                            className={styles.sort}
                                                            icon={faSort}
                                                        />
                                                }
                                            </div>
                                        </th>
                                    ))
                                }
                            </tr>
                        ))
                    }
                </thead>
                <tbody {...getTableBodyProps()}>
                    {loading && <Loader />}
                    {data.length < 1 && <tr className={styles['no-data']}><td>{noDataText}</td></tr>}
                    {
                        rows.map((row) => {
                            prepareRow(row);
                            return (
                                <tr {...row.getRowProps()}>
                                    {
                                        row.cells.map(cell => {
                                            return (
                                                <td
                                                    className={cell.column.className ?? ''}
                                                    {...cell.getCellProps()}
                                                >
                                                    {cell.render('Cell')}
                                                </td>
                                            );
                                        })
                                    }
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        </div>
    );
};

export default Table;
