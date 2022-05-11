import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { toast } from 'react-toastify';
import { affName, negName } from '@speechanddebate/nsda-js-utils';

import { deleteTeam } from '../helpers/api';
import { useStore } from '../helpers/store';

import Breadcrumbs from '../layout/Breadcrumbs';
import Table from '../tables/Table';
import Loader from '../loader/Loader';
import AddTeam from './AddTeam';
import ConfirmButton from '../helpers/ConfirmButton';
// import TabroomChaptersDropdown from './TabroomChaptersDropdown';

import styles from './TeamList.module.css';

const TeamList = () => {
    const { caselist, school } = useParams();
    const { schoolData, caselistData, teams, fetchSchool, fetchTeams } = useStore();
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        setFetching(true);
        fetchSchool(caselist, school);
        fetchTeams(caselist, school);
        setFetching(false);
    }, [caselist, school, fetchSchool, fetchTeams]);

    const handleDeleteTeam = useCallback(async (name) => {
        try {
            toast.dismiss();
            const response = await deleteTeam(caselist, school, name);
            await fetchTeams(caselist, school);
            toast.success(response.message);
        } catch (err) {
            toast.error(`Failed to delete team: ${err.message}`);
            console.log(err);
        }
    }, [caselist, school, fetchTeams]);

    const handleDeleteTeamConfirm = useCallback((e) => {
        const name = e.currentTarget.dataset?.name;
        if (!name) { return false; }
        const team = teams.find(t => t.name === name);
        toast.warning(({ closeToast }) => (
            <ConfirmButton
                message={`Are you sure you want to delete ${team.display_name} and all linked rounds? This cannot be undone.`}
                handler={() => handleDeleteTeam(name)}
                dismiss={closeToast}
                requireInput
            />),
        {
            autoClose: 15000,
            closeOnClick: false,
            closeButton: false,
        },
        );
    }, [handleDeleteTeam, teams]);

    const data = useMemo(() => teams, [teams]);
    const columns = useMemo(() => [
        {
            Header: 'Team',
            width: 'auto',
            accessor: 'display_name',
            Cell: (row) => {
                return (
                    <>
                        <Link to={`/${caselist}/${school}/${row.row.original?.name}`}>
                            {row.row.original.display_name} (
                            <span>{row.row.original.debater1_first} </span>
                            <span>{row.row.original.debater1_last} </span>
                            <span>- </span>
                            <span>{row.row.original.debater2_first} </span>
                            <span>{row.row.original.debater2_last}</span>
                            )
                        </Link>
                        <div className={styles['hover-links']}>
                            <Link to={`/${caselist}/${school}/${row.row.original?.name}/Aff`}>{affName(caselistData.event)}</Link>
                            <Link to={`/${caselist}/${school}/${row.row.original?.name}/Neg`}>{negName(caselistData.event)}</Link>
                        </div>
                    </>
                );
            },
        },
        {
            id: 'delete',
            width: '25px',
            Header: '',
            disableSortBy: true,
            disableFilters: true,
            accessor: (row) => row,
            className: styles.center,
            Cell: (row) => (
                !caselistData.archived &&
                <FontAwesomeIcon
                    className={styles.trash}
                    icon={faTrash}
                    data-name={row.value?.name}
                    onClick={e => handleDeleteTeamConfirm(e)}
                />
            ),
        },
    ], [caselist, school, handleDeleteTeamConfirm, caselistData]);

    const timestamp = moment(schoolData?.updated_at, 'YYYY-MM-DD HH:mm:ss').format('l');

    if (fetching) { return <Loader />; }

    return (
        <>
            <div className={styles.teamlist}>
                <Breadcrumbs />
                <h1 className={styles.schoolname}>{schoolData.display_name}</h1>
                {
                    schoolData.updated_by &&
                    <p className={styles.timestamp}>
                        Last updated by {schoolData.updated_by} on {timestamp}
                    </p>
                }
                {/* <TabroomChaptersDropdown /> */}
                <Table columns={columns} data={data} className={styles['team-table']} noDataText="No teams found" loading={fetching} />
            </div>
            <hr />
            {!caselistData.archived && <AddTeam />}
        </>
    );
};

export default TeamList;
