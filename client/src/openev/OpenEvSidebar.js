import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import { startOfYear } from '@speechanddebate/nsda-js-utils';

import { useStore } from '../helpers/store';
import { campAbbreviations, tagAbbreviations } from '../helpers/common';

import styles from './OpenEvSidebar.module.css';

const Sidebar = () => {
    const { year } = useParams();
    const { openEvFiles, fetchOpenEvFiles } = useStore();

    useEffect(() => {
        const getFiles = async () => {
            await fetchOpenEvFiles(year || startOfYear);
        };
        getFiles();
    }, [year, fetchOpenEvFiles]);

    useEffect(() => {
        document.title = `openCaselist - ${year || startOfYear} Open Evidence Project`;
        return () => { document.title = 'openCaselist'; };
    }, [year]);

    const [visible, setVisible] = useState(true);
    const handleToggleVisible = () => {
        setVisible(!visible);
    };

    if (openEvFiles.message) { return false; }

    const camps = [...new Set(openEvFiles.map(c => c.camp))]?.sort();

    let tags = [];
    openEvFiles.forEach(file => {
        if (!file.tags) { return false; }
        try {
            const t = JSON.parse(file.tags);
            if (Object.keys(t).length > 0) {
                Object.keys(t)?.filter(f => t[f] === true)?.forEach(ft => tags.push(ft));
            }
        } catch (err) {
            // Ignore
        }
    });
    tags = [...new Set(tags)].sort();

    const years = [];
    for (let i = startOfYear; i >= 2013; i--) {
        years.push(i);
    }

    return (
        <div className={`${styles.sidebar} ${!visible && styles['sidebar-collapsed']}`}>
            <div className={styles.toggle} onClick={handleToggleVisible} title="Click to toggle sidebar">
                <span>{visible ? '«' : '»'}</span>
            </div>
            <div className={!visible && styles['sidebar-contents-collapsed']}>
                <h2>
                    <span>Files By Camp ({year || startOfYear}) </span>
                </h2>
                {
                    camps && camps.length > 0 &&
                        <div>
                            <ul>
                                {
                                    camps.map(c => {
                                        return (
                                            <li key={c}>
                                                <Link to={`/openev/${year || startOfYear}/${c}`}>
                                                    {campAbbreviations[c]}
                                                </Link>
                                            </li>
                                        );
                                    })
                                }
                            </ul>
                        </div>
                }

                <h2>
                    <span>Files By Type ({year || startOfYear}) </span>
                </h2>
                {
                    tags && tags.length > 0 &&
                        <div>
                            <ul>
                                {
                                    tags.map(t => {
                                        return (
                                            <li key={t}>
                                                <Link to={`/openev/${year || startOfYear}/${t}`}>
                                                    {tagAbbreviations[t]}
                                                </Link>
                                            </li>
                                        );
                                    })
                                }
                            </ul>
                        </div>
                }
                <h2>
                    Archive
                </h2>
                {
                    years.map(y => (
                        <ul>
                            <li>
                                <Link to={`/openev/${y}`}>{y} Open Ev</Link>
                                <span> | </span>
                                <a href={`https://#/${y}.zip`} target="_blank" rel="noopener noreferrer">
                                    <FontAwesomeIcon
                                        className={styles.download}
                                        icon={faFileDownload}
                                        title={`Download all ${y} Open Ev Files`}
                                    />
                                    <span> All</span>
                                </a>
                            </li>
                        </ul>
                    ))
                }
            </div>
        </div>
    );
};

export default Sidebar;
