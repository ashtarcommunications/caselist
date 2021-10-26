import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { loadSchools } from './api';
import './Sidebar.css';

const Sidebar = () => {
    const [schools, setSchools] = useState([]);

    const { caselist } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const schoolData = await loadSchools(caselist);
                setSchools(schoolData || []);
            } catch (err) {
                console.log(err);
                setSchools([]);
            }
        };
        fetchData();
    }, [caselist]);

    return (
        <div className="sidebar">
            <h2>Quick Links</h2>
            <ul>
                <li>Archived Caselists</li>
                <li>Recently Modified</li>
            </ul>

            {
                schools && schools.length > 0 &&
                    <div>
                        <h2>
                            <span>Schools </span>
                            <Link to={`${caselist}/add`}>
                                <button type="button" className="pure-button pure-button-primary">
                                    <FontAwesomeIcon className="plus" icon={faPlus} />
                                    <span> Add</span>
                                </button>
                            </Link>
                        </h2>
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
