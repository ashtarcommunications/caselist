import React from 'react';
import { useParams } from 'react-router-dom';
import { startOfYear } from '@speechanddebate/nsda-js-utils';

import { useStore } from '../helpers/store';

import FilesTable from './FilesTable';

const OpenEvHome = () => {
    const { year } = useParams();
    const { openEvFiles } = useStore();

    return (
        <div>
            <h1>Open Evidence Project</h1>
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
                <span>Modest membership dues provide the financial support needed to maintain</span>
                <span>this resource as a freely-available service to the community.</span>
            </p>

            <h3>All {year || startOfYear} Open Evidence Files</h3>
            <FilesTable files={openEvFiles} />
        </div>
    );
};

export default OpenEvHome;
