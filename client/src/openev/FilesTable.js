import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useParams, Link } from 'react-router-dom';
import { startOfYear } from '@speechanddebate/nsda-js-utils';

import { campAbbreviations, tagAbbreviations } from '../helpers/common';

import Table from '../tables/Table';

import styles from './FilesTable.module.css';

const FilesTable = ({ files, loading }) => {
    const { year } = useParams();

    const columns = useMemo(() => [
        {
            Header: 'Name',
            accessor: row => row,
            Cell: (row) => {
                return (
                    <Link to={`/download?path=${row.value.path}`}>
                        {row.value.name}
                    </Link>
                );
            },
        },
        {
            Header: 'Camp',
            accessor: 'camp',
            Cell: (row) => {
                return (
                    <Link to={`/openev/${year || startOfYear}/${row.value}`}>
                        <span>{campAbbreviations[row.value]}</span>
                    </Link>
                );
            },
        },
        {
            Header: 'Tags',
            accessor: 'tags',
            Cell: (row) => {
                let tags = [];
                try {
                    const json = JSON.parse(row.value);
                    tags = Object.keys(json).filter(t => t);
                } catch (err) {
                    console.log(err);
                }
                return (
                    <p>
                        {
                            tags.map(t => (
                                <Link to={`/openev/${year || startOfYear}/${t}`}>
                                    <span className={styles.tag}>{tagAbbreviations[t]}</span>
                                </Link>
                            ))
                        }
                    </p>
                );
            },
        },
    ], [year]);

    return (
        <Table
            columns={columns}
            data={files}
            className="table"
            loading={loading}
        />
    );
};

FilesTable.propTypes = {
    files: PropTypes.array,
    loading: PropTypes.bool,
};

export default FilesTable;
