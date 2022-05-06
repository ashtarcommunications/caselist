import React, { useMemo } from 'react';
import Table from '../tables/Table';

const FilesTable = ({ files, loading }) => {
    const columns = useMemo(() => [
        { Header: 'Path', accessor: 'path' },
        { Header: 'Year', accessor: 'year' },
        { Header: 'Camp', accessor: 'camp' },
        { Header: 'Lab', accessor: 'lab' },
        { Header: 'Tags', accessor: 'tags' },
    ], []);

    return (
        <Table
            columns={columns}
            data={files}
            className="table"
            loading={loading}
        />
    );
};

export default FilesTable;
