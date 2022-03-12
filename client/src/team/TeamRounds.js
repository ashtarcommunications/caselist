import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faEnvelope, faPlus } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import moment from 'moment';
import { Link, useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import Loader from '../loader/Loader';
import Error from '../layout/Error';
import { loadTeam, addTabroomTeamLink } from '../helpers/api';
import RoundsTable from './RoundsTable';
import CitesTable from './CitesTable';
import ConfirmButton from '../helpers/ConfirmButton';
import './TeamRounds.css';

const TeamRounds = () => {
    const { caselist, school, team, side } = useParams();

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

    return (
        <div className="roundlist">
            <h1 className="teamname">
                {school} {team}
                <button type="button" className="pure-button pure-button-secondary notes" onClick={handleToggleNotes}>
                    <FontAwesomeIcon
                        icon={faEnvelope}
                    />
                </button>
                <button type="button" className="pure-button pure-button-primary claim" onClick={handleLinkConfirm}>
                    <FontAwesomeIcon
                        icon={faLink}
                    />
                    Claim Page
                </button>
            </h1>
            <p className="timestamp">Last updated by {teamData.updated_by ? teamData.updated_by : 'unknown'} on {timestamp}</p>
            <div className="notes">
                {
                    showNotes &&
                        <MDEditor
                            onChange={handleChangeNotes}
                            value={notes}
                        />
                }
            </div>
            <div className="buttons">
                <Link to={`/${caselist}/${school}/${team}`}>
                    <button
                        type="button"
                        className={`pure-button all ${!side && 'selected-side'}`}
                    >
                        All
                    </button>
                </Link>
                <Link to={`/${caselist}/${school}/${team}/Aff`}>
                    <button
                        type="button"
                        className={`pure-button aff ${side === 'Aff' && 'selected-side'}`}
                    >
                        Aff
                    </button>
                </Link>
                <Link to={`/${caselist}/${school}/${team}/Neg`}>
                    <button
                        type="button"
                        className={`pure-button neg ${side === 'Neg' && 'selected-side'}`}
                    >
                        Neg
                    </button>
                </Link>
                <Link to={`/${caselist}/${school}/${team}/add`} className="add-round">
                    <button type="button" className="pure-button add-round">
                        <FontAwesomeIcon className="plus" icon={faPlus} />
                        <span> Add Round</span>
                    </button>
                </Link>
            </div>
            <RoundsTable />
            <CitesTable />
        </div>
    );
};

export default TeamRounds;
