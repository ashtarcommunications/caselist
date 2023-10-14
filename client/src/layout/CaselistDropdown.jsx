import React, { useState, useEffect } from 'react';
import uniqBy from 'lodash/uniqBy';
import { useNavigate, useParams } from 'react-router-dom';
import { startOfYear } from '@speechanddebate/nsda-js-utils';

import { loadCaselists } from '../helpers/api';

import styles from './CaselistDropdown.module.css';

const CaselistDropdown = () => {
    const navigate = useNavigate();
    const { caselist } = useParams();

    const [caselists, setCaselists] = useState([]);
    const [years, setYears] = useState([]);
    const [year, setYear] = useState(startOfYear);

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

    useEffect(() => {
        const selectedCaselist = caselists.find(c => c.name === caselist) || {};
        if (selectedCaselist.name) {
            document.title = `openCaselist - ${selectedCaselist.display_name}`;
        }
        setYear(selectedCaselist.year || startOfYear);
        // Reset title on unmount
        return () => { document.title = 'openCaselist'; };
    }, [caselist, caselists]);

    const filteredCaselists = caselists.filter(c => c.year === year).sort();

    const handleChangeYear = (e) => {
        setYear(parseInt(e.target.value));
    };

    const handleChangeCaselist = (e) => {
        const selected = caselists.find(c => c.name === e.target.value) || {};

        // For static archived sites, redirect to the archived URL
        if (selected?.archived && selected?.archive_url) {
            window.location.href = selected?.archive_url;
            return false;
        }

        document.title = `openCaselist - ${selected.display_name}`;
        navigate(`/${e.target.value}`);
    };

    return (
        <div>
            <form className="form pure-form">
                <select
                    className={styles.select}
                    onChange={handleChangeYear}
                    value={year}
                    name="year"
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
                <select onChange={handleChangeCaselist} value={caselist} className={styles.select} name="caselist">
                    <option value="">Choose a Caselist</option>
                    {
                        filteredCaselists.map(c => {
                            return (
                                <option
                                    key={c.caselist_id}
                                    value={c.name}
                                >
                                    {c.display_name}
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
