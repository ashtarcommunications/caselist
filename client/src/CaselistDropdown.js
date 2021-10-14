import React, { useState, useEffect } from 'react';
import uniqBy from 'lodash/uniqBy';
import { useHistory } from 'react-router-dom';
import { loadCaselists } from './api';
import './CaselistDropdown.css';

const CaselistDropdown = () => {
    const history = useHistory();

    const [caselists, setCaselists] = useState([]);
    const [years, setYears] = useState([]);
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const caselistsData = await loadCaselists(true);
                setCaselists(caselistsData || []);
                const distinctYears = uniqBy(caselistsData, 'year').map(c => c.year).sort().reverse();
                setYears(distinctYears);
            } catch (err) {
                console.log(err);
                setCaselists([]);
                setYears([]);
            }
        };
        fetchData();
    }, []);

    const filteredCaselists = caselists.filter(c => c.year === year).sort();

    const handleChangeYear = (e) => {
        setYear(parseInt(e.currentTarget.value));
    };

    const handleChangeCaselist = (e) => {
        history.push(`/${e.currentTarget.value}`);
    };

    return (
        <div>
            <form className="form pure-form">
                <select onChange={handleChangeYear}>
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
                <select onChange={handleChangeCaselist}>
                    <option value="">Choose a Caselist</option>
                    {
                        filteredCaselists.map(c => {
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
