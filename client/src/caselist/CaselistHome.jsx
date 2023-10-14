import React from 'react';
import Markdown from 'react-markdown';

import { useStore } from '../helpers/store';

import Error from '../layout/Error';

import styles from './CaselistHome.module.css';

const CaselistHome = () => {
    const { caselistData } = useStore();

    const markdown = '# # This would create Heading 1 - Pocket/Title\n## ## This would create Heading 2 - Hat/Section\n### ### This would create Heading 3 - Block Title/Argument Title\n#### #### This would create Heading 4 - Tag';

    if (caselistData.message) {
        return <Error statusCode={caselistData.statusCode} message={caselistData.message} />;
    }

    return (
        <div className={styles['caselist-home']}>
            <h1>{caselistData.display_name}</h1>
            {
                caselistData.archived &&
                <h2 className={styles.archived}>
                    This caselist is archived, no changes are allowed
                </h2>
            }
            <div>
                <p>
                    This site provides a space for collaborative intel for the
                    debate community.
                </p>

                <h2>How to use this site</h2>

                <p>To add a school, use the button on the sidebar.</p>

                <p>
                    On your school home page, you can create new teams by using the form at
                    the bottom.
                </p>

                <p>
                    You are strongly encouraged to create cites using
                    <a href="https://www.markdownguide.org/" target="_blank" rel="noopener noreferrer"> markdown </a>
                    syntax, such as that produced automatically in Verbatim.
                    If you are pasting directly from Word, it will be unformatted text.
                </p>

                <p>
                    You can create heading levels in
                    <a href="https://www.markdownguide.org/" target="_blank" rel="noopener noreferrer"> markdown </a>
                    syntax using #
                </p>
                <Markdown className="cites">{markdown}</Markdown>
            </div>
            <iframe
                width="560"
                height="315"
                src={import.meta.env.VITE_TUTORIAL_VIDEO}
                title="How to use openCaselist"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
};

export default CaselistHome;
