import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import Combobox from 'react-widgets/Combobox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { sortBy } from 'lodash';

import { useStore } from '../helpers/store';
import { useAuth } from '../helpers/auth';
import { addTeam, loadTabroomStudents } from '../helpers/api.js';
import { useDeviceDetect } from '../helpers/mobile.js';
import { alphanumericDash } from '../helpers/common.js';
import ConfirmButton from '../helpers/ConfirmButton';
import Error from '../layout/Error';
import Untrusted from '../layout/Untrusted';

import 'react-widgets/styles.css';
import styles from './AddTeam.module.css';

const AddTeam = () => {
	const auth = useAuth();
	const { caselist, school } = useParams();
	const { caselistData, teams, fetchTeams } = useStore();
	const { isMobile } = useDeviceDetect();

	const [fetching, setFetching] = useState(false);
	const [students, setStudents] = useState([]);
	const [teamSize, setTeamSize] = useState(caselistData.team_size);
	const [showWarning, setShowWarning] = useState(false);

	const {
		handleSubmit,
		reset,
		control,
		setValue,
		unregister,
		formState: { errors, isValid },
	} = useForm({
		mode: 'all',
		defaultValues: {
			debater1_first: '',
			debater1_last: '',
			debater2_first: '',
			debater2_last: '',
			debater3_first: '',
			debater3_last: '',
			debater4_first: '',
			debater4_last: '',
		},
	});

	const watchFields = useWatch({ control });

	// Soft warning if not using title case for names
	useEffect(() => {
		let warn = false;
		Object.keys(watchFields).forEach((f) => {
			if (
				watchFields[f] &&
				watchFields[f]?.charAt(0) === watchFields[f]?.charAt(0)?.toLowerCase()
			) {
				warn = true;
			}
		});
		setShowWarning(warn);
	}, [watchFields]);

	// Update the default team size if changing caselists
	useEffect(() => {
		setTeamSize(caselistData.team_size);
	}, [caselistData]);

	const loadStudents = () => {
		const fetchStudents = async () => {
			// Don't refetch on subsequent clicks
			if (students.length > 0) {
				return false;
			}
			try {
				setFetching(true);
				let tabroomStudents = (await loadTabroomStudents()) || [];
				tabroomStudents = sortBy(tabroomStudents, 'last');
				setStudents(tabroomStudents);
				setFetching(false);
			} catch (err) {
				setFetching(false);
				setStudents([]);
			}
			return true;
		};
		return fetchStudents();
	};

	const addTeamHandler = async (data) => {
		try {
			if (!data) {
				return false;
			}
			setFetching(true);
			const response = await addTeam(caselist, school, data);
			toast.success(response.message);
			reset({}, { keepDefaultValues: true });
			fetchTeams(caselist, school);
			setFetching(false);
		} catch (err) {
			setFetching(false);
			toast.error(`Failed to add team: ${err.message}`);
		}
		return true;
	};

	const addStudentHandler = () => {
		if (teamSize >= 4) {
			return false;
		}
		return setTeamSize(teamSize + 1);
	};

	const removeStudentHandler = () => {
		if (teamSize <= caselistData.teamSize) {
			return false;
		}
		unregister([`debater${teamSize}_first`, `debater${teamSize}_last`]);
		return setTeamSize(teamSize - 1);
	};

	const addAllTeamsHandler = (e) => {
		const name = e.currentTarget?.name;
		const data = {
			debater1_first: 'All',
			debater1_last: name === 'novices' ? 'Novices' : 'Teams',
		};

		const message = `Are you sure you want to add a team for general disclosure for all ${name === 'novices' ? 'novices' : 'teams'}?`;

		toast.warning(
			({ closeToast }) => (
				<ConfirmButton
					message={message}
					handler={() => addTeamHandler(data)}
					dismiss={closeToast}
				/>
			),
			{
				autoClose: 15000,
				closeButton: false,
			},
		);
		return true;
	};

	if (caselistData.message || teams.message) {
		return (
			<Error
				statusCode={caselistData.statusCode || teams.statusCode}
				message={caselistData.message || teams.message}
			/>
		);
	}

	if (!auth.user?.trusted) {
		return <Untrusted />;
	}

	return (
		<div>
			<h3>Add a {caselistData.team_size > 1 ? 'Team' : 'Debater'}</h3>
			<div className={styles.buttons}>
				{teams.filter((t) => t.name === 'All').length < 1 && (
					<button
						type="button"
						name="all"
						className={`pure-button ${styles.allteams}`}
						onClick={addAllTeamsHandler}
						title="Add a team for general disclosure for all teams"
					>
						<FontAwesomeIcon className={styles.plus} icon={faPlus} />
						<span> All Teams</span>
					</button>
				)}
				{teams.filter((t) => t.name === 'Novices').length < 1 && (
					<button
						type="button"
						name="novices"
						className={`pure-button ${styles.allteams}`}
						onClick={addAllTeamsHandler}
						title="Add a team for general disclosure for all novices"
					>
						<FontAwesomeIcon className={styles.plus} icon={faPlus} />
						<span> All Novices</span>
					</button>
				)}
			</div>
			<form
				onSubmit={handleSubmit(addTeamHandler)}
				className={`${styles['add-team']} pure-form`}
			>
				<div>
					{Array.from({ length: teamSize }).map((x, i) => (
						// eslint-disable-next-line react/no-array-index-key
						<div className={!isMobile && styles.flex} key={i}>
							<Controller
								control={control}
								name={`debater${i + 1}_first`}
								rules={{
									required: true,
									minLength: 2,
									validate: {
										alphanumericDash: (v) =>
											alphanumericDash.test(v) ||
											'Only letters and numbers allowed',
										length: (v) =>
											v.length === v.trim().length ||
											'No leading/trailing spaces allowed',
									},
								}}
								render={({
									field: { onChange, onBlur, value },
									fieldState: { error },
								}) => (
									<div className={styles.first}>
										<label htmlFor={`debater${i + 1}_first`}>
											Debater #{i + 1} First
										</label>
										<Combobox
											id={`debater${i + 1}_first`}
											containerClassName={`${styles.combo} ${error && styles.error}`}
											busy={fetching}
											hideCaret={fetching || students.length < 1}
											data={students}
											dataKey="id"
											textField="name"
											hideEmptyPopup
											filter="contains"
											value={value}
											onChange={(e) => {
												if (typeof e === 'string') {
													return onChange(e);
												}
												setValue(`debater${i + 1}_last`, e.last);
												return onChange(e.first);
											}}
											inputProps={{ onFocus: loadStudents, onBlur }}
										/>
									</div>
								)}
							/>
							<Controller
								control={control}
								name={`debater${i + 1}_last`}
								rules={{
									required: true,
									minLength: 2,
									validate: {
										alphanumericDash: (v) =>
											alphanumericDash.test(v) ||
											'Only letters and numbers allowed',
										length: (v) =>
											v.length === v.trim().length ||
											'No leading/trailing spaces allowed',
									},
								}}
								render={({
									field: { onChange, onBlur, value },
									fieldState: { error },
								}) => (
									<div>
										<label htmlFor={`debater${i + 1}_last`}>
											Debater #{i + 1} Last
										</label>
										<Combobox
											id={`debater${i + 1}_last`}
											containerClassName={`${styles.combo} ${error && styles.error}`}
											busy={fetching}
											hideCaret={fetching || students.length < 1}
											data={students}
											dataKey="id"
											textField="name"
											hideEmptyPopup
											filter="contains"
											value={value}
											onChange={(e) => {
												if (typeof e === 'string') {
													return onChange(e);
												}
												setValue(`debater${i + 1}_first`, e.first);
												return onChange(e.last);
											}}
											inputProps={{ onFocus: loadStudents, onBlur }}
										/>
									</div>
								)}
							/>
							<br />
						</div>
					))}
					<div className={styles.addremove}>
						{teamSize > caselistData.team_size && (
							<button
								type="button"
								data-testid="remove-debater"
								className={`${styles['remove-debater']} pure-button`}
								onClick={removeStudentHandler}
							>
								<FontAwesomeIcon className={styles.minus} icon={faMinus} />
							</button>
						)}
						{teamSize < 4 && (
							<button
								type="button"
								data-testid="add-debater"
								className={`${styles['add-debater']} pure-button`}
								onClick={addStudentHandler}
							>
								<FontAwesomeIcon className={styles.plus} icon={faPlus} />
							</button>
						)}
					</div>
				</div>
				{showWarning && (
					<p className={styles.warning}>
						Please use title case for debater names
					</p>
				)}
				{Object.keys(errors).map((e) => (
					<p key={e} className={styles.warning}>
						{errors[e]?.message}
					</p>
				))}
				<button
					className={`${styles['add-team-button']} pure-button`}
					type="submit"
					disabled={!isValid}
				>
					Add
				</button>
			</form>
		</div>
	);
};

export default AddTeam;
