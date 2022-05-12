import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

import { useStore } from '../helpers/store';

import styles from './Breadcrumbs.module.css';

const Breadcrumbs = () => {
    const { caselist, school, team } = useParams();
    const { caselistData, schoolData } = useStore();

    return (
        <div className={styles.breadcrumbs}>
            <Link to="/">
                <FontAwesomeIcon
                    className="home"
                    icon={faHome}
                />
            </Link>

            {caselist && <Link to={`/${caselist}`}><span> / {caselistData.name}</span></Link>}
            {school && <Link to={`/${caselist}/${school}`}><span> / {schoolData.display_name}</span></Link>}
            {team && <Link to={`/${caselist}/${school}/${team}`}><span> / {team}</span></Link>}
        </div>
    );
};

export default Breadcrumbs;
