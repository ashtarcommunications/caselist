import React, { useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faPlus } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import moment from 'moment';
import { Link, useParams } from 'react-router-dom';
import { normalizeSide, roundName } from '@speechanddebate/nsda-js-utils';

import { useStore } from '../helpers/store';
import { loadTeam, loadRounds, deleteRound, loadCites, deleteCite, addTabroomTeamLink } from '../helpers/api';

import ConfirmButton from '../helpers/ConfirmButton';
import Loader from '../loader/Loader';
import Breadcrumbs from '../layout/Breadcrumbs';
import TeamNotes from './TeamNotes';
import RoundsTable from './RoundsTable';
import CitesTable from './CitesTable';

import styles from './TeamRounds.module.css';

const TeamRounds = () => {
    const { caselist, school, team, side } = useParams();

    const { caselistData } = useStore();

    const [fetching, setFetching] = useState(false);
    const [teamData, setTeamData] = useState({});
    const [rounds, setRounds] = useState([]);
    const [cites, setCites] = useState([]);

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await loadRounds(caselist, school, team);
                if (response) {
                    setRounds(
                        side
                        ? response.filter(r => r.side === normalizeSide(side))
                        : response
                    );
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, [caselist, school, team, side]);

    const handleDeleteRound = useCallback(async (id) => {
        try {
            toast.dismiss();
            const response = await deleteRound(caselist, school, team, parseInt(id));
            toast.success(response.message);
            setRounds(rounds.filter(r => r.round_id !== parseInt(id)));
            setCites(cites.filter(c => c.round_id !== parseInt(id)));
        } catch (err) {
            console.log(err);
            toast.error(`Failed to delete round: ${err.message}`);
        }
    }, [caselist, school, team, rounds, cites]);

    const handleDeleteRoundConfirm = useCallback((e) => {
        const id = e.currentTarget.id;
        if (!id) { return false; }
        const round = rounds.find(r => r.round_id === parseInt(id));
        toast.warning(({ closeToast }) => (
            <ConfirmButton
                message={`Are you sure you want to delete ${round.tournament} ${roundName(round.round)} and all linked cites?`}
                handler={() => handleDeleteRound(id)}
                dismiss={closeToast}
            />),
        {
            autoClose: 15000,
            closeOnClick: false,
            closeButton: false,
        },
        );
    }, [handleDeleteRound, rounds]);

    const handleToggleReport = useCallback((e) => {
        const newRounds = [...rounds];
        newRounds.forEach(r => {
            if (r.round_id === parseInt(e.currentTarget.id)) {
                r.reportopen = !r.reportopen;
            }
        });
        setRounds(newRounds);
    }, [rounds]);

    const allRoundsOpen = rounds?.filter(r => r.reportopen).length === rounds.length;

    const handleToggleAll = useCallback(() => {
        const newRounds = [...rounds];
        newRounds.forEach(r => {
            r.reportopen = !allRoundsOpen;
        });
        setRounds(newRounds);
    }, [allRoundsOpen, rounds]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await loadCites(caselist, school, team);
                setCites(side ? response.filter(r => r.side === side) : response);
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, [caselist, school, team, side]);

    const handleDeleteCite = useCallback(async (id) => {
        try {
            toast.dismiss();
            const response = await deleteCite(caselist, school, team, parseInt(id));
            toast.success(response.message);
            setCites(cites.filter(c => c.cite_id !== parseInt(id)));
        } catch (err) {
            console.log(err);
            toast.error(`Failed to delete cite: ${err.message}`);
        }
    }, [caselist, school, team, cites]);

    const handleDeleteCiteConfirm = useCallback((e) => {
        const id = e.currentTarget.id;
        if (!id) { return false; }
        toast.warning(({ closeToast }) => (
            <ConfirmButton
                message={`Are you sure you want to delete this cite entry?`}
                handler={() => handleDeleteCite(id)}
                dismiss={closeToast}
            />),
        {
            autoClose: 15000,
            closeOnClick: false,
            closeButton: false,
        },
        );
    }, [handleDeleteCite]);

    const handleToggleCites = useCallback((e) => {
        const newCites = [...cites];
        newCites.forEach(c => {
            if (c.cite_id === parseInt(e.currentTarget.id)) {
                c.citesopen = !c.citesopen;
            }
        });
        setCites(newCites);
    }, [cites]);

    const handleLinkPage = async () => {
        try {
            const response = await addTabroomTeamLink(window.location.pathname);
            toast.success(response.message);
        } catch (err) {
            toast.error(`Failed to link page: ${err.message}`);
            console.log(err);
        }
    };
    const handleLinkConfirm = async () => {
        toast(<ConfirmButton
            message="Are you sure? Claiming this page will link it to your Tabroom account to easily add rounds you have participated in. You should only claim your own page, not someone else's."
            handler={handleLinkPage}
        />);
    };

    const timestamp = moment(teamData.updated_at, 'YYYY-MM-DD HH:mm:ss').format('l');

    if (fetching) { return <Loader />; }

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
        <div>
            <Breadcrumbs />
            <h1 className={styles.teamname}>
                {school} {team} {!caselistData.archived && `(${lastNames})`}
                {
                    !caselistData.archived &&
                    <button type="button" className={`pure-button ${styles.claim}`} onClick={handleLinkConfirm}>
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

            <TeamNotes teamData={teamData} />

            <div className={styles.buttons}>
                <Link to={`/${caselist}/${school}/${team}`}>
                    <button
                        type="button"
                        className={`pure-button ${styles.side} ${!side && styles['selected-side']}`}
                    >
                        All
                    </button>
                </Link>
                <Link to={`/${caselist}/${school}/${team}/Aff`}>
                    <button
                        type="button"
                        className={`pure-button ${styles.side} ${side === 'Aff' && styles['selected-side']}`}
                    >
                        Aff
                    </button>
                </Link>
                <Link to={`/${caselist}/${school}/${team}/Neg`}>
                    <button
                        type="button"
                        className={`pure-button ${styles.side} ${side === 'Neg' && styles['selected-side']}`}
                    >
                        Neg
                    </button>
                </Link>
                {
                    !caselistData.archived &&
                    <Link to={`/${caselist}/${school}/${team}/add`} className={styles['add-round']}>
                        <button type="button" className={`pure-button`}>
                            <FontAwesomeIcon icon={faPlus} />
                            <span> Add Round</span>
                        </button>
                    </Link>
                }
            </div>
            <RoundsTable
                event={caselistData.event}
                archived={caselistData.archived}
                rounds={rounds}
                handleDeleteRoundConfirm={handleDeleteRoundConfirm}
                handleToggleAll={handleToggleAll}
                handleToggleReport={handleToggleReport}
                allRoundsOpen={allRoundsOpen}
            />
            <CitesTable
                event={caselistData.event}
                archived={caselistData.archived}
                cites={cites}
                handleDeleteCiteConfirm={handleDeleteCiteConfirm}
                handleToggleCites={handleToggleCites}
            />
        </div>
    );
};

export default TeamRounds;
