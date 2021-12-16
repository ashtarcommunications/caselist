import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../helpers/store';
import { startOfYear } from '../helpers/common';
import CaselistDropdown from './CaselistDropdown';
import './Sidebar.css';

const Sidebar = () => {
    const { caselist } = useParams();
    const { schools, fetchSchools, caselist: caselistData, fetchCaselist } = useStore();
    useEffect(() => {
        fetchSchools(caselist);
    }, [caselist, fetchSchools]);
    useEffect(() => {
        if (!caselistData || caselist !== caselistData.slug) {
            fetchCaselist(caselist);
        }
    }, [caselist, caselistData, fetchCaselist]);

    const [visible, setVisible] = useState(true);
    const handleToggleVisible = () => {
        setVisible(!visible);
    };

    return (
        <div className={`sidebar ${!visible && 'sidebar-collapsed'}`}>
            <div className="toggle" onClick={handleToggleVisible} title="Click to toggle sidebar">
                <span>{visible ? '«' : '»'}</span>
            </div>
            <div className={!visible ? 'sidebar-contents-collapsed' : undefined}>
                <CaselistDropdown />
                {
                    caselistData.year !== startOfYear &&
                    <h2>THIS CASELIST IS ARCHIVED, NO CHANGES ARE ALLOWED</h2>
                }
                <h2>
                    <span>Schools </span>
                    {
                        caselistData.year === startOfYear &&
                        <Link to={`/${caselist}/add`}>
                            <button type="button" className="green pure-button">
                                <FontAwesomeIcon className="plus" icon={faPlus} />
                                <span> Add</span>
                            </button>
                        </Link>
                    }
                </h2>
                <p>
                    <Link to={`/${caselist}/recent`}>Recently Modified</Link>
                </p>
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
