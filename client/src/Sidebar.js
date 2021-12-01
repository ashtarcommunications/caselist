import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from './store';
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

    return (
        <div className="sidebar">
            <h2>
                <span>Schools </span>
                <Link to={`/${caselist}/add`}>
                    <button type="button" className="green pure-button">
                        <FontAwesomeIcon className="plus" icon={faPlus} />
                        <span> Add</span>
                    </button>
                </Link>
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
    );
};

export default Sidebar;
