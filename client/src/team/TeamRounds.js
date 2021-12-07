import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import moment from 'moment';
import { Link, useParams } from 'react-router-dom';
import { loadTeam, addTabroomTeamLink } from '../helpers/api';
import RoundsTable from './RoundsTable';
import CitesTable from './CitesTable';
import ConfirmButton from '../helpers/ConfirmButton';
import './TeamRounds.css';

const TeamRounds = () => {
    const { caselist, school, team } = useParams();

    const [teamData, setTeamData] = useState({});
    useEffect(() => {
        const fetchData = async () => {
            try {
                setTeamData(await loadTeam(caselist, school, team));
            } catch (err) {
                setTeamData({});
                console.log(err);
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
            message="Are you sure you want to link this page to your Tabroom account?"
            handler={handleLinkPage}
        />);
    };

    const timestamp = moment(teamData.updated_at, 'YYYY-MM-DD HH:mm:ss').format('l');

    return (
        <div className="roundlist">
            <h1 className="teamname">
                {school} {team}
                <button type="button" className="pure-button pure-button-primary claim" onClick={handleLinkConfirm}>
                    <FontAwesomeIcon
                        icon={faLink}
                    />
                    Claim Page
                </button>
            </h1>
            <p className="timestamp">Last updated by {teamData.updated_by} on {timestamp}</p>
            <div className="buttons">
                <Link to={`/${caselist}/${school}/${team}/Aff`}>
                    <button type="button" className="pure-button pure-button-primary aff">Aff</button>
                </Link>
                <Link to={`/${caselist}/${school}/${team}/Neg`}>
                    <button type="button" className="pure-button pure-button-primary neg">Neg</button>
                </Link>
                <Link to={`/${caselist}/${school}/${team}`}>
                    <button type="button" className="pure-button pure-button-primary both">Both</button>
                </Link>
                <Link to={`/${caselist}/${school}/${team}/add`} className="add">
                    <button type="button" className="pure-button pure-button-primary add">+ Add Round</button>
                </Link>
            </div>
            <RoundsTable />
            <CitesTable />
        </div>
    );
};

export default TeamRounds;
