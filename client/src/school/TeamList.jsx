import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Link, useParams } from 'wouter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faTrash,
	faCaretDown,
	faCaretUp,
} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { toast } from 'react-toastify';
import { affName, negName } from '@speechanddebate/nsda-js-utils';

import { deleteTeam } from '../helpers/api.js';
import { useStore } from '../helpers/store';
import { useAuth } from '../helpers/auth';
import { useDeviceDetect } from '../helpers/mobile.js';

import Breadcrumbs from '../layout/Breadcrumbs';
import Table from '../tables/Table';
import Loader from '../loader/Loader';
import Error from '../layout/Error';
import AddTeam from './AddTeam';
import ConfirmButton from '../helpers/ConfirmButton';
import HistoryTable from '../tables/HistoryTable';

import styles from './TeamList.module.css';

const TeamList = () => {
	const auth = useAuth();
	const { caselist, school } = useParams();
	const { caselistData, schoolData, teams, fetchTeams } = useStore();
	const [fetching, setFetching] = useState(false);
	const [showHistory, setShowHistory] = useState(false);
	const { isMobile } = useDeviceDetect();

	useEffect(() => {
		setFetching(true);
		fetchTeams(caselist, school);
		setFetching(false);
	}, [caselist, school, fetchTeams]);

	const handleDeleteTeam = useCallback(
		async (name) => {
			try {
				toast.dismiss();
				const response = await deleteTeam(caselist, school, name);
				await fetchTeams(caselist, school);
				toast.success(response.message);
			} catch (err) {
				toast.error(`Failed to delete team: ${err.message}`);
			}
		},
		[caselist, school, fetchTeams],
	);

	const handleDeleteTeamConfirm = useCallback(
		(e) => {
			const name = e.currentTarget.dataset?.name;
			if (!name) {
				return false;
			}
			const team = teams.find((t) => t.name === name);
			toast.warning(
				({ closeToast }) => (
					<ConfirmButton
						message={`Are you sure you want to delete ${team.display_name} and all linked rounds? This cannot be undone.`}
						handler={() => handleDeleteTeam(name)}
						dismiss={closeToast}
						requireInput
					/>
				),
				{
					autoClose: 15000,
					closeOnClick: false,
					closeButton: false,
				},
			);
			return true;
		},
		[handleDeleteTeam, teams],
	);

	const handleToggleHistory = () => {
		setShowHistory(!showHistory);
	};

	const data = useMemo(() => teams, [teams]);
	const columns = useMemo(
		() => [
			{
				Header: 'Team',
				width: 'auto',
				accessor: 'display_name',
				Cell: (row) => {
					let displayName;
					if (['All', 'Novices'].indexOf(row.row?.original?.name) > -1) {
						displayName = row.value;
					} else {
						displayName = `${row.value}`;
						displayName += ` (`;
						displayName += row.row?.original?.debater1_first
							? `${row.row?.original?.debater1_first} ${row.row?.original?.debater1_last}`
							: '';
						displayName += row.row?.original?.debater2_first
							? ` - ${row.row?.original?.debater2_first} ${row.row?.original?.debater2_last}`
							: '';
						displayName += row.row?.original?.debater3_first
							? ` - ${row.row?.original?.debater3_first} ${row.row?.original?.debater3_last}`
							: '';
						displayName += row.row?.original?.debater4_first
							? ` - ${row.row?.original?.debater4_first} ${row.row?.original?.debater4_last}`
							: '';
						displayName += `)`;
					}
					return (
						<>
							<Link to={`/${caselist}/${school}/${row.row.original?.name}`}>
								{displayName}
							</Link>
							{!isMobile && (
								<div className={styles['hover-links']}>
									<Link
										to={`/${caselist}/${school}/${row.row.original?.name}/Aff`}
									>
										{affName(caselistData.event)}
									</Link>
									<Link
										to={`/${caselist}/${school}/${row.row.original?.name}/Neg`}
									>
										{negName(caselistData.event)}
									</Link>
								</div>
							)}
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
				Cell: (row) =>
					auth.user?.admin || (auth.user?.trusted && !caselistData.archived) ? (
						<FontAwesomeIcon
							className={styles.trash}
							icon={faTrash}
							data-testid="trash"
							data-name={row.value?.name}
							onClick={(e) => handleDeleteTeamConfirm(e)}
						/>
					) : null,
			},
		],
		[
			caselist,
			school,
			isMobile,
			caselistData.event,
			caselistData.archived,
			auth.user?.trusted,
			handleDeleteTeamConfirm,
		],
	);

	const timestamp = moment(
		schoolData?.updated_at,
		'YYYY-MM-DD HH:mm:ss',
	).format('l');

	if (fetching) {
		return <Loader />;
	}

	if (caselistData.message || schoolData.message) {
		return (
			<Error
				statusCode={caselistData.statusCode || schoolData.statusCode}
				message={caselistData.message || schoolData.message}
			/>
		);
	}

	return (
		<>
			<div className={styles.teamlist}>
				<Breadcrumbs />
				<h1 className={styles.schoolname}>{schoolData.display_name}</h1>
				{schoolData.updated_by && (
					<p className={styles.timestamp}>
						Last updated by {schoolData.updated_by} on {timestamp}
					</p>
				)}
				<Table
					columns={columns}
					data={data}
					className={`${styles['team-table']} ${isMobile && styles.mobile}`}
					noDataText="No teams yet - add one with the form below"
					loading={fetching}
				/>
			</div>
			<hr />
			{!caselistData.archived && <AddTeam />}
			{!caselistData.archived && (
				<div>
					<hr />
					{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
					<h3 onClick={handleToggleHistory}>
						School History
						<FontAwesomeIcon
							className={styles.showhistory}
							data-testid="showhistory"
							icon={showHistory ? faCaretDown : faCaretUp}
							title="School History"
						/>
					</h3>
					{showHistory && <HistoryTable type="school" />}
				</div>
			)}
		</>
	);
};

export default TeamList;
