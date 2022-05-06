import React from 'react';
import { useTable, useFilters, useSortBy } from 'react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faSort } from '@fortawesome/free-solid-svg-icons';

import Loader from '../loader/Loader';

import styles from './Table.module.css';

const Table = ({ columns = [], data = [], className, loading = false, noDataText = 'No data found!', filterable = true }) => {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data }, useFilters, useSortBy);

    if (!columns || !data) return false;

    if (loading) { return <Loader />; }

    return (
        <div className={styles.table}>
            <table {...getTableProps()} className={`pure-table pure-table-bordered ${className}`}>
                <thead>
                    {
                        headerGroups.map(headerGroup => (
                            <React.Fragment key={headerGroup.id}>
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {
                                        headerGroup.headers.map(column => (
                                            <th key={column.id} {...column.getHeaderProps()} style={{ width: column.width || 'auto', maxWidth: column.maxWidth || 'auto' }}>
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
                                <tr>
                                    {
                                        filterable &&
                                        headerGroup.headers.map(column => (
                                            <th key={column.id} {...column.getHeaderProps()}>
                                                {
                                                    /* eslint-disable no-nested-ternary */
                                                    column.canFilter
                                                        ? column.Filter
                                                        ? column.render('Filter')
                                                        :
                                                        <input
                                                            className={styles.filter}
                                                            value={column.filterValue || ''}
                                                            onChange={e => column.setFilter(e.target.value || undefined)}
                                                            placeholder={column.filterPlaceholder}
                                                            disabled={column.disableFilters}
                                                        />
                                                    :
                                                        ''
                                                }
                                            </th>
                                        ))
                                    }
                                </tr>
                            </React.Fragment>
                        ))
                    }

                </thead>
                <tbody {...getTableBodyProps()}>
                    {data.length < 1 && <tr className={styles['no-data']}><td>{noDataText}</td></tr>}
                    {
                        rows.map((row) => {
                            prepareRow(row);
                            return (
                                <tr key={row.id} {...row.getRowProps()}>
                                    {
                                        row.cells.map(cell => {
                                            return (
                                                <td
                                                    key={cell.id}
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
