import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { startOfYear } from '@speechanddebate/nsda-js-utils';

import { loadOpenEv } from '../helpers/api';

import FilesTable from './FilesTable';
// import styles from './CaselistHome.module.css';

const OpenEvHome = () => {
    const { year } = useParams();
    const [files, setFiles] = useState([]);
    useEffect(() => {
        const getFiles = async () => {
            const response = await loadOpenEv(year || startOfYear);
            setFiles(response);
        };
        getFiles();
    }, [year]);

    return (
        <div>
            <h1>Open Evidence</h1>
            <FilesTable files={files} />
        </div>
    );
};

export default OpenEvHome;
