import { displaySide, roundName } from '@speechanddebate/nsda-js-utils';
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { loadRecent } from '../helpers/api';
import { useStore } from '../helpers/store';

import Breadcrumbs from '../layout/Breadcrumbs';
import Loader from '../loader/Loader';
import Error from '../layout/Error';

const Recent = () => {
    const [teams, setTeams] = useState([]);
    const [fetching, setFetching] = useState(false);

    const { caselist } = useParams();

    const { caselistData } = useStore();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (caselist) {
                    setFetching(true);
                    const response = await loadRecent(caselist);
                    setTeams(response || []);
                    setFetching(false);
                }
            } catch (err) {
                setTeams([]);
                setFetching(false);
                console.log(err);
            }
        };
        fetchData();
    }, [caselist]);

    if (fetching) { return <Loader />; }

    if (caselistData.message instanceof Error) {
        return <Error statusCode={caselistData.statusCode} message={caselistData.message} />;
    }

    return (
        <div>
            <Breadcrumbs />
            <h1>Recently Modified</h1>
            {!fetching && teams.length === 0 && <p>No recent modifications</p>}
            {
                teams.map(t => (
                    <p>
                        <Link key={t.team_id} to={`/${caselist}/${t.school_name}/${t.team_name}`}>
                            <span>{t.team_display_name}</span>
                            {
                                t.tournament &&
                                <>
                                    <span> - {t.tournament} </span>
                                    <span>{roundName(t.round)} </span>
                                    <span>{displaySide(t.side, caselistData.event)} </span>
                                    <span>vs {t.opponent}</span>
                                </>
                            }
                        </Link>
                    </p>
                ))
            }
        </div>
    );
};

export default Recent;
