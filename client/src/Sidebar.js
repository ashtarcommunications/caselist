import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const loadSchools = async () => {
    const response = await fetch(
        'http://localhost:10010/v1/ndtceda21/schools',
        { headers: { 'Content-Type': 'application/json' } },
    );
    return response.json();
};

function Sidebar() {
    const [schools, setSchools] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setSchools(await loadSchools());
            } catch (err) {
                console.log(err);
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
                <li><Link to="/school">School</Link></li>
                {
                    schools.map(s => {
                        return <li key={s.school_id}>{s.display_name}</li>;
                    })
                }
            </ul>
        </div>
    );
}

export default Sidebar;
