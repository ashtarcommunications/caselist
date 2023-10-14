import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { startOfYear } from '@speechanddebate/nsda-js-utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { useStore } from '../helpers/store';
import { campAbbreviations, tagAbbreviations } from '../helpers/common';
import { useAuth } from '../helpers/auth';

import Breadcrumbs from '../layout/Breadcrumbs';
import Error from '../layout/Error';
import FilesTable from './FilesTable';

import styles from './OpenEvHome.module.css';

const OpenEvHome = () => {
    const { year, tag } = useParams();
    const { openEvFiles } = useStore();
    const auth = useAuth();

    if (openEvFiles.message) {
        return <Error statusCode={openEvFiles.statusCode} message={openEvFiles.message} />;
    }

    let heading = `All ${year || startOfYear} Open Evidence Files`;
    let filteredFiles;
    if (tag) {
        if (Object.keys(campAbbreviations).indexOf(tag) > -1) {
            heading = `${year} ${campAbbreviations[tag]}`;
            filteredFiles = openEvFiles.filter(f => f.camp === tag);
        } else {
            heading = `${year} ${tagAbbreviations[tag]}`;
            filteredFiles = openEvFiles.filter(f => JSON.parse(f.tags)?.[tag]);
        }
    }

    return (
        <div>
            <Breadcrumbs />
            <h1>Open Evidence Project {year || startOfYear}</h1>
            {
                !tag &&
                <>
                    <h2>Welcome to the NDCA&apos;s Open Ev Project</h2>

                    <p>
                        This a collection of files freely shared by the summer debate camps.
                        Anyone can download these files, free of charge.
                        Use them to teach debate, compete, or learn about the topic.
                    </p>

                    <p>
                        <span>If you appreciate this resource, please consider </span>
                        <a href="https://paperlessdebate.com/donate" target="_blank" rel="noopener noreferrer">donating</a>
                        <span> or becoming a member of the </span>
                        <a href="https://debatecoaches.org" target="_blank" rel="noopener noreferrer">NDCA. </a>
                        <span>Modest membership dues provide the financial support needed to </span>
                        <span>maintain this resource as a freely-available service to the </span>
                        <span>community.</span>
                    </p>
                </>
            }
            <h2>{heading}</h2>
            {
                !tag && auth.user?.admin &&
                <Link to={`/openev/${year || startOfYear}/upload`} className={styles.add}>
                    <button type="button" className={`pure-button`}>
                        <FontAwesomeIcon icon={faPlus} />
                        <span> Add File</span>
                    </button>
                </Link>
            }
            <FilesTable files={tag ? filteredFiles : openEvFiles} />
        </div>
    );
};

export default OpenEvHome;
