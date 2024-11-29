import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'wouter';
import { startOfYear } from '@speechanddebate/nsda-js-utils';

import { useStore } from '../helpers/store';
import { useAuth } from '../helpers/auth';
import CaselistDropdown from './CaselistDropdown';
import StatesDropdown from '../caselist/StatesDropdown';

import styles from './Sidebar.module.css';

const Sidebar = () => {
	const auth = useAuth();
	const { caselist, school } = useParams();
	const { caselistData, fetchCaselist, schools, fetchSchools, fetchSchool } =
		useStore();

	useEffect(() => {
		if (caselist) {
			fetchCaselist(caselist);
			fetchSchools(caselist);
		}
	}, [caselist, caselistData.name, fetchCaselist, fetchSchools]);

	useEffect(() => {
		if (caselist && school) {
			fetchSchool(caselist, school);
		}
	}, [caselist, school, fetchSchool]);

	const [stateCode, setStateCode] = useState('');
	const [filter, setFilter] = useState('');

	const handleFilterChange = (e) => {
		setFilter(e.target.value);
	};

	const [visible, setVisible] = useState(true);
	const handleToggleVisible = () => {
		setVisible(!visible);
	};

	if (caselistData.message) {
		return false;
	}

	let filteredSchools = stateCode
		? schools.filter((s) => s.state === stateCode)
		: schools;
	filteredSchools = filter
		? filteredSchools.filter((s) =>
				s.display_name.toLowerCase().includes(filter.toLowerCase()),
			)
		: filteredSchools;

	return (
		<div
			className={`${styles.sidebar} ${!visible ? styles['sidebar-collapsed'] : undefined}`}
		>
			{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
			<div
				className={styles.toggle}
				onClick={handleToggleVisible}
				title="Click to toggle sidebar"
			>
				<span>{visible ? '«' : '»'}</span>
			</div>
			<div
				className={!visible ? styles['sidebar-contents-collapsed'] : undefined}
			>
				<CaselistDropdown />
				{caselistData.archived ? (
					<p className={styles.archived}>
						This caselist is archived, no changes are allowed
					</p>
				) : (
					false
				)}
				<h2>
					<span>Schools </span>
					{auth.user?.trusted &&
						!caselistData.archived &&
						caselistData.year === startOfYear() && (
							<Link to={`/${caselist}/add`}>
								<button
									type="button"
									className={`${styles['add-school']} pure-button`}
								>
									<FontAwesomeIcon className={styles.plus} icon={faPlus} />
									<span> Create</span>
								</button>
							</Link>
						)}
				</h2>
				<ul>
					{!caselistData.archived && (
						<li>
							<Link to={`/${caselist}/recent`}>Recently Modified</Link>
						</li>
					)}
					<li>
						<Link to={`/${caselist}/downloads`}>Bulk Downloads</Link>
					</li>
				</ul>
				{caselistData.level === 'hs' && (
					<form className="pure-form">
						<label htmlFor="state">State</label>
						<StatesDropdown
							required={false}
							stateCode={stateCode}
							changeStateCode={(e) => setStateCode(e.currentTarget.value)}
						/>
					</form>
				)}
				<form className="pure-form" onSubmit={(e) => e.preventDefault()}>
					<label htmlFor="filter">Filter</label>
					<input
						type="text"
						className={styles.filter}
						id="filter"
						name="filter"
						onChange={handleFilterChange}
						value={filter}
					/>
				</form>
				{filteredSchools && filteredSchools.length > 0 && (
					<div className={styles.schools}>
						<ul>
							{filteredSchools.map((s) => {
								return (
									<li key={s.school_id}>
										<Link to={`/${caselist}/${s.name}`}>
											{s.display_name}
											{caselistData.level === 'hs' &&
												s.state &&
												` (${s.state})`}
										</Link>
									</li>
								);
							})}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
};

export default Sidebar;
