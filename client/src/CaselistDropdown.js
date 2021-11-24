import React, { useState, useEffect } from 'react';
import uniqBy from 'lodash/uniqBy';
import { useHistory, useParams } from 'react-router-dom';
import { loadCaselists } from './api';
import { startOfYear } from './common';
import './CaselistDropdown.css';

const CaselistDropdown = () => {
    const history = useHistory();
    const { caselist } = useParams();

    const [caselists, setCaselists] = useState([]);

    // TODO - dropdowns not setting default value correctly
    const selectedCaselist = caselists.find(c => c.slug === caselist) || {};
    if (selectedCaselist.name) {
        document.title = `openCaselist - ${selectedCaselist.name}`;
    }
    const defaultYear = selectedCaselist.year || startOfYear;

    const [years, setYears] = useState([]);
    const [year, setYear] = useState(defaultYear);

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
        const selected = caselists.find(c => c.slug === e.currentTarget.value) || {};
        document.title = `openCaselist - ${selected.name}`;
    };

    return (
        <div>
            <form className="form pure-form">
                <select
                    onChange={handleChangeYear}
                    value={year}
                >
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
                <select onChange={handleChangeCaselist} value={caselist}>
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
