import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadSchools } from './api';
import './Sidebar.css';

function Sidebar() {
    const [schools, setSchools] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const schoolData = await loadSchools('ndtceda21');
                setSchools(schoolData || []);
            } catch (err) {
                console.log(err);
                setSchools([]);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="sidebar">
            <h2>Quick Links</h2>
            <ul>
                <li>Archived Caselists</li>
                <li>Recently Modified</li>
            </ul>

            <h2>Schools</h2>
            <ul>
                {
                    schools.map(s => {
                        return <li key={s.school_id}><Link to="/school">{s.display_name}</Link></li>;
                    })
                }
            </ul>
        </div>
    );
}

export default Sidebar;
