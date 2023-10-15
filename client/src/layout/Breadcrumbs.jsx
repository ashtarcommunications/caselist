import React from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

import { useStore } from '../helpers/store';
import { campAbbreviations, tagAbbreviations } from '../helpers/common';

import styles from './Breadcrumbs.module.css';

const Breadcrumbs = () => {
    const { caselist, school, team, year, tag } = useParams();
    const location = useLocation();
    const { caselistData, schoolData } = useStore();

    const openev = location.pathname.startsWith('/openev');

    return (
        <div className={styles.breadcrumbs}>
            <Link to="/">
                <FontAwesomeIcon
                    className="home"
                    icon={faHome}
                />
            </Link>

            {openev && <Link to={`/openev`}><span> / Open Ev</span></Link>}
            {year && <Link to={`/openev/${year}`}><span> / {year}</span></Link>}
            {tag && <Link to={`/openev/${year}/${tag}`}><span> / {campAbbreviations[tag] || tagAbbreviations[tag]}</span></Link>}

            {caselist && <Link to={`/${caselist}`}><span> / {caselistData.name}</span></Link>}
            {school && <Link to={`/${caselist}/${school}`}><span> / {schoolData.display_name}</span></Link>}
            {team && <Link to={`/${caselist}/${school}/${team}`}><span> / {team}</span></Link>}
        </div>
    );
};

export default Breadcrumbs;
