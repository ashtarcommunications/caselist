import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'wouter';

import { loadSchoolHistory, loadTeamHistory } from '../helpers/api.js';
import Table from './Table';
import Loader from '../loader/Loader';

const HistoryTable = ({ type = 'school' }) => {
	const { caselist, school, team } = useParams();
	const [fetching, setFetching] = useState(false);
	const [history, setHistory] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setFetching(true);
				if (type === 'team') {
					setHistory(await loadTeamHistory(caselist, school, team));
				} else {
					setHistory(await loadSchoolHistory(caselist, school));
				}
				setFetching(false);
			} catch (err) {
				setHistory(err);
				setFetching(false);
			}
		};
		fetchData();
	}, [type, caselist, school, team]);

	const data = useMemo(() => history, [history]);
	const columns = [
		{
			Header: 'Description',
			width: 'auto',
			accessor: 'description',
		},
		{
			Header: 'Date (UTC)',
			width: 'auto',
			accessor: 'updated_at',
		},
		{
			Header: 'User',
			width: 'auto',
			accessor: 'updated_by',
		},
	];

	if (fetching) {
		return <Loader />;
	}

	return (
		<div>
			<Table
				columns={columns}
				data={data}
				noDataText="No history found"
				loading={fetching}
			/>
		</div>
	);
};

HistoryTable.propTypes = {
	type: PropTypes.string,
};

export default HistoryTable;
