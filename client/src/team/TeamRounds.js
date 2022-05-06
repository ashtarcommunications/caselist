import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faFileLines } from '@fortawesome/free-regular-svg-icons';
import { toast } from 'react-toastify';
import moment from 'moment';
import { Link, useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';

import { useStore } from '../helpers/store';
import { loadTeam, addTabroomTeamLink } from '../helpers/api';
import ConfirmButton from '../helpers/ConfirmButton';
import Loader from '../loader/Loader';
import Error from '../layout/Error';
import RoundsTable from './RoundsTable';
import CitesTable from './CitesTable';

import styles from './TeamRounds.module.css';

const TeamRounds = () => {
    const { caselist, school, team, side } = useParams();

    const { caselist: caselistData } = useStore();

    const [fetching, setFetching] = useState(false);
    const [teamData, setTeamData] = useState({});
    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState(teamData.notes);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setFetching(true);
                setTeamData(await loadTeam(caselist, school, team));
                setFetching(false);
            } catch (err) {
                setTeamData({ message: 'Team not found' });
                setFetching(false);
            }
        };
        fetchData();
    }, [caselist, school, team]);

    const handleLinkPage = async () => {
        try {
            const response = await addTabroomTeamLink(window.location.pathname);
            toast.success(response.message);
        } catch (err) {
            console.log(err);
        }
    };
    const handleLinkConfirm = async () => {
        toast(<ConfirmButton
            message="Are you sure? Claiming this page will link it to your Tabroom account to easily add rounds you have participated in. You should only claim your own page, not someone else's."
            handler={handleLinkPage}
        />);
    };

    const handleToggleNotes = async () => {
        setShowNotes(!showNotes);
    };

    const handleChangeNotes = async (e) => {
        setNotes(e.value);
    };

    const timestamp = moment(teamData.updated_at, 'YYYY-MM-DD HH:mm:ss').format('l');

    if (fetching) { return <Loader />; }
    if (!fetching && teamData.message) { return <Error is404 />; }

    let lastNames = '';
    switch (caselistData.team_size) {
        case 1:
            lastNames = `${teamData.debater1_last}`;
            break;
        case 2:
        default:
            lastNames = `${teamData.debater1_last}-${teamData.debater2_last}`;
            break;
    }

    return (
        <div className={styles.roundlist}>
            <h1 className={styles.teamname}>
                {school} {team} {!caselistData.archived && `(${lastNames})`}
                <button
                    type="button"
                    className={`pure-button pure-button-secondary ${styles.notes}`}
                    onClick={handleToggleNotes}
                    title="Team notes"
                >
                    <FontAwesomeIcon
                        icon={faFileLines}
                    />
                </button>
                {
                    !caselistData.archived &&
                    <button type="button" className={`pure-button pure-button-primary ${styles.claim}`} onClick={handleLinkConfirm}>
                        <FontAwesomeIcon
                            icon={faLink}
                        />
                        Claim Page
                    </button>
                }
            </h1>
            {
                teamData.updated_by &&
                <p className={styles.timestamp}>Last updated by {teamData.updated_by ? teamData.updated_by : 'unknown'} on {timestamp}</p>
            }
            <div className={styles.notes}>
                {
                    showNotes &&
                        <MDEditor
                            onChange={handleChangeNotes}
                            value={notes}
                        />
                }
            </div>
            <div className={styles.buttons}>
                <Link to={`/${caselist}/${school}/${team}`}>
                    <button
                        type="button"
                        className={`pure-button ${styles.side} ${!side ? styles['selected-side'] : undefined}`}
                    >
                        All
                    </button>
                </Link>
                <Link to={`/${caselist}/${school}/${team}/Aff`}>
                    <button
                        type="button"
                        className={`pure-button ${styles.side} ${side === 'Aff' ? styles['selected-side'] : undefined}`}
                    >
                        Aff
                    </button>
                </Link>
                <Link to={`/${caselist}/${school}/${team}/Neg`}>
                    <button
                        type="button"
                        className={`pure-button ${styles.side} ${side === 'Neg' ? styles['selected-side'] : undefined}`}
                    >
                        Neg
                    </button>
                </Link>
                {
                    !caselistData.archived &&
                    <Link to={`/${caselist}/${school}/${team}/add`} className={styles['add-round']}>
                        <button type="button" className={`pure-button`}>
                            <FontAwesomeIcon className={styles.plus} icon={faPlus} />
                            <span> Add Round</span>
                        </button>
                    </Link>
                }
            </div>
            <RoundsTable event={caselistData.event} />
            <CitesTable />
        </div>
    );
};

export default TeamRounds;
