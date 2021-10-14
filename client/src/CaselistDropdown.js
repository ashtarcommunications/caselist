import React, { useState, useEffect } from 'react';
import uniqBy from 'lodash/uniqBy';
import { loadCaselists } from './api';
import './CaselistDropdown.css';

const CaselistDropdown = () => {
    const [caselists, setCaselists] = useState([]);
    const [years, setYears] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const caselistsData = await loadCaselists(true);
                setCaselists(caselistsData || []);
                const distinctYears = uniqBy(caselistsData, 'year').map(c => c.year);
                setYears(distinctYears);
            } catch (err) {
                console.log(err);
                setCaselists([]);
                setYears([]);
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            <form className="form pure-form">
                <select>
                    {
                        years.map(y => {
                            return (
                                <option
                                    key={y}
                                    value={y}
                                >
                                    {`${y}-${y + 1}`}
                                </option>
                            );
                        })
                    }
                </select>
                <select>
                    <option value="">Choose a Caselist</option>
                    {
                        caselists.map(c => {
                            return (
                                <option
                                    key={c.caselist_id}
                                    value={c.slug}
                                >
                                    {c.name}
                                </option>
                            );
                        })
                    }
                </select>
            </form>
        </div>
    );
};

export default CaselistDropdown;
