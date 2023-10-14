import React, { useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faPlus } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import moment from 'moment';
import { Link, useParams } from 'react-router-dom';
import { normalizeSide, roundName } from '@speechanddebate/nsda-js-utils';

import { useStore } from '../helpers/store';
import { loadTeam, loadRounds, deleteRound, loadCites, deleteCite, addCite, addTabroomLink } from '../helpers/api';
import { useDeviceDetect } from '../helpers/mobile';

import ConfirmButton from '../helpers/ConfirmButton';
import Loader from '../loader/Loader';
import Error from '../layout/Error';
import Breadcrumbs from '../layout/Breadcrumbs';
import TeamNotes from './TeamNotes';
import AddCite from './AddCite';
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

    const { isMobile } = useDeviceDetect();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setFetching(true);
                setTeamData(await loadTeam(caselist, school, team));
                setFetching(false);
            } catch (err) {
                console.log(err);
                setTeamData(err);
                setFetching(false);
            }
        };
        fetchData();
    }, [caselist, school, team]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let response = await loadRounds(caselist, school, team);
                const newRounds = side
                    ? response.filter(r => r.side === normalizeSide(side))
                    : response;
                setRounds(newRounds);

                response = await loadCites(caselist, school, team);
                const newCites = side
                    ? response.filter(cite => newRounds.map(
                        round => round.round_id
                    ).indexOf(cite.round_id) > -1)
                    : response;
                setCites(newCites);
            } catch (err) {
                console.log(err);
                setRounds(err);
                setCites(err);
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

    const allRoundsOpen = !rounds.message
        && rounds?.filter(r => r.reportopen).length === rounds.length;

    const handleToggleAll = useCallback(() => {
        const newRounds = [...rounds];
        newRounds.forEach(r => {
            r.reportopen = !allRoundsOpen;
        });
        setRounds(newRounds);
    }, [allRoundsOpen, rounds]);

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

    const handleAddCite = async (data) => {
        const cite = { round_id: parseInt(data.round_id), ...data.cites[0] };
        try {
            let response = await addCite(caselist, school, team, cite);
            toast.success(response.message);
            response = await loadCites(caselist, school, team);
            setCites(side ? response.filter(r => r.side === side) : response);
        } catch (err) {
            toast.error(`Failed to add cite: ${err.message}`);
            console.log(err);
        }
    };

    const handleLinkPage = async () => {
        try {
            let slug = window.location.pathname;
            if (slug.endsWith('/Aff')
                || slug.endsWith('/Neg')
                || slug.endsWith('/Pro')
                || slug.endsWith('/Con')
            ) {
                slug = slug.slice(0, -4);
            }
            const response = await addTabroomLink(slug);
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

    if (
        caselistData.message
        || teamData.message
        || rounds.message
        || cites.message
    ) {
        return (
            <Error
                statusCode={
                    caselistData.statusCode
                   || teamData.statusCode
                   || rounds.statusCode
                   || cites.statusCode
                }
                message={
                    caselistData.message
                    || teamData.message
                    || rounds.message
                    || cites.message
                }
            />
        );
    }

    let lastNames = '';
    if (teamData.debater1_last) {
        lastNames += `${teamData.debater1_last}`;
    }
    if (teamData.debater2_last) {
        lastNames += `-${teamData.debater2_last}`;
    }
    if (teamData.debater3_last) {
        lastNames += `-${teamData.debater3_last}`;
    }
    if (teamData.debater4_last) {
        lastNames += `-${teamData.debater4_last}`;
    }

    if (teamData.name === 'All' || teamData.name === 'Novices') {
        lastNames = null;
    }

    return (
        <div className={isMobile ? styles.mobile : undefined}>
            <Breadcrumbs />
            <h1 className={styles.teamname}>
                {teamData.display_name} {!caselistData.archived && lastNames && `(${lastNames})`}
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
            {
                !caselistData.archived && rounds.length > 0 &&
                <AddCite rounds={rounds} event={caselistData.event} handleAddCite={handleAddCite} />
            }
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
