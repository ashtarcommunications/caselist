import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { startOfYear } from '@speechanddebate/eslint-config-nsda';

import { useStore } from '../helpers/store';
import CaselistDropdown from './CaselistDropdown';

import styles from './Sidebar.module.css';

const Sidebar = () => {
    const { caselist } = useParams();
    const { schools, fetchSchools, caselistData, fetchCaselist } = useStore();

    useEffect(() => {
        fetchCaselist(caselist);
        fetchSchools(caselist);
    }, [caselist, fetchCaselist, fetchSchools]);

    const [visible, setVisible] = useState(true);
    const handleToggleVisible = () => {
        setVisible(!visible);
    };

    if (caselistData.message) { return false; }

    return (
        <div className={`${styles.sidebar} ${!visible ? styles['sidebar-collapsed'] : undefined}`}>
            <div className={styles.toggle} onClick={handleToggleVisible} title="Click to toggle sidebar">
                <span>{visible ? '«' : '»'}</span>
            </div>
            <div className={!visible ? styles['sidebar-contents-collapsed'] : undefined}>
                <CaselistDropdown />
                {
                    caselistData.archived
                    ? <p>THIS CASELIST IS ARCHIVED, NO CHANGES ARE ALLOWED</p>
                    : false
                }
                <h2>
                    <span>Schools </span>
                    {
                        !caselistData.archived && caselistData.year === startOfYear &&
                        <Link to={`/${caselist}/add`}>
                            <button type="button" className="green-button pure-button">
                                <FontAwesomeIcon className={styles.plus} icon={faPlus} />
                                <span> Add</span>
                            </button>
                        </Link>
                    }
                </h2>
                {
                    !caselistData.archived &&
                    <p>
                        <Link to={`/${caselist}/recent`}>Recently Modified</Link>
                    </p>
                }
                {
                    schools && schools.length > 0 &&
                        <div>
                            <ul>
                                {
                                    schools.map(s => {
                                        return <li key={s.school_id}><Link to={`/${caselist}/${s.name}`}>{s.display_name}</Link></li>;
                                    })
                                }
                            </ul>
                        </div>
                }
            </div>
        </div>
    );
};

export default Sidebar;
