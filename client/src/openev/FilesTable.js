import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useParams, Link } from 'react-router-dom';
import { startOfYear } from '@speechanddebate/nsda-js-utils';

import { campAbbreviations, tagAbbreviations } from '../helpers/common';

import DownloadFile from '../helpers/DownloadFile';
import Table from '../tables/Table';

import styles from './FilesTable.module.css';

const FilesTable = ({ files, loading }) => {
    const { year } = useParams();

    const columns = useMemo(() => [
        {
            Header: 'Name',
            accessor: 'name',
            Cell: (row) => {
                return (
                    <DownloadFile path={row.row?.original?.path} text={row.value} />
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
            accessor: (row) => {
                // Convert the JSON into a comma delimited list of tags so the table filter can search it
                let tags = '';
                if (!row.tags) { return ''; }
                try {
                    const t = JSON.parse(row.tags);
                    if (Object.keys(t).length > 0) {
                        Object.keys(t)?.filter(f => t[f] === true)?.forEach(ft => { tags += `${tagAbbreviations[ft]},`; });
                    }
                } catch (err) {
                    console.log(err);
                }
                return tags;
            },
            Cell: (row) => {
                const tags = [];
                if (!row.row?.original?.tags) { return false; }
                try {
                    const t = JSON.parse(row.row?.original?.tags);
                    if (Object.keys(t).length > 0) {
                        Object.keys(t)?.filter(f => t[f] === true)?.forEach(ft => tags.push(ft));
                    }
                } catch (err) {
                    console.log(err);
                }
                return (
                    <p className={styles.tags}>
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
            noDataText="No files found!"
        />
    );
};

FilesTable.propTypes = {
    files: PropTypes.array,
    loading: PropTypes.bool,
};

export default FilesTable;
