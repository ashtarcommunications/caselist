import React, { useEffect, useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { StoreContext } from './store';
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

    const store = useContext(StoreContext);

    return (
        <div className="sidebar">
            <h1>Current Caselist: {JSON.stringify(store.caselist)}</h1>
            <h2>Quick Links</h2>
            <ul>
                <li>Archived Caselists</li>
                <li>Recently Modified</li>
            </ul>

            {
                schools && schools.length > 0 &&
                    <div>
                        <h2>Schools</h2>
                        <ul>
                            {
                                schools.map(s => {
                                    return <li key={s.school_id}><Link to="/school">{s.display_name}</Link></li>;
                                })
                            }
                        </ul>
                    </div>
            }
        </div>
    );
};

export default Sidebar;
