import React from 'react';
import { useParams } from 'react-router-dom';
import { startOfYear } from '@speechanddebate/nsda-js-utils';

import { useStore } from '../helpers/store';
import { campAbbreviations, tagAbbreviations } from '../helpers/common';

import Error from '../layout/Error';
import FilesTable from './FilesTable';

const OpenEvHome = () => {
    const { year, tag } = useParams();
    const { openEvFiles } = useStore();

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
            <h1>Open Evidence Project {year}</h1>
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
            <FilesTable files={tag ? filteredFiles : openEvFiles} />
        </div>
    );
};

export default OpenEvHome;
