import React, { useState, useEffect } from 'react';
import uniqBy from 'lodash/uniqBy';
import { useHistory, useParams } from 'react-router-dom';

import { loadCaselists } from '../helpers/api';
import { startOfYear } from '../helpers/common';
import { useStore } from '../helpers/store';

import styles from './CaselistDropdown.module.css';

const CaselistDropdown = () => {
    const history = useHistory();
    const { caselist } = useParams();
    const { fetchCaselist } = useStore();

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
    }, [caselist, caselists]);

    const filteredCaselists = caselists.filter(c => c.year === year).sort();

    const handleChangeYear = (e) => {
        setYear(parseInt(e.currentTarget.value));
    };

    const handleChangeCaselist = (e) => {
        const selected = caselists.find(c => c.name === e.currentTarget.value) || {};
        document.title = `openCaselist - ${selected.display_name}`;
        fetchCaselist(e.currentTarget.value);
        history.push(`/${e.currentTarget.value}`);
    };

    return (
        <div>
            <form className="form pure-form">
                <select
                    className={styles.select}
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
                <select onChange={handleChangeCaselist} value={caselist} className={styles.select}>
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
