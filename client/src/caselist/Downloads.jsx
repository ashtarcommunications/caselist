import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { orderBy } from 'lodash';

import { loadDownloads } from '../helpers/api.js';
import { useStore } from '../helpers/store';

import Breadcrumbs from '../layout/Breadcrumbs';
import Loader from '../loader/Loader';
import Error from '../layout/Error';

const Downloads = () => {
	const [downloads, setDownloads] = useState([]);
	const [fetching, setFetching] = useState(false);

	const { caselist } = useParams();

	const { caselistData } = useStore();

	useEffect(() => {
		const fetchData = async () => {
			try {
				if (caselist) {
					setFetching(true);
					const response = await loadDownloads(caselist);
					setDownloads(response || []);
					setFetching(false);
				}
			} catch (err) {
				setFetching(false);
				setDownloads([]);
			}
		};
		fetchData();
	}, [caselist]);

	const fulldownload = orderBy(
		downloads.filter((d) => d.name.includes('all')),
		'name',
		'desc',
	);
	const weeklies = orderBy(
		downloads.filter((d) => d.name.includes('weekly')),
		'name',
		'desc',
	);

	if (fetching) {
		return <Loader />;
	}

	if (caselistData.message) {
		return (
			<Error
				statusCode={caselistData.statusCode}
				message={caselistData.message}
			/>
		);
	}

	return (
		<div>
			<Breadcrumbs />
			<h1>Bulk downloads for {caselistData.display_name}</h1>
			<p>
				<span>Downloads are updated at midnight every Tuesday morning. </span>
			</p>
			{!fetching && downloads.length === 0 ? (
				<h3>No bulk downloads available for this caselist.</h3>
			) : (
				<>
					<h2>All open source files</h2>
					{fulldownload.map((d) => (
						<p key={d.url}>{d.url && <a href={d.url}>{d.name}</a>}</p>
					))}

					<h2>Open source files by week</h2>
					{weeklies.map((d) => (
						<p key={d.url}>{d.url && <a href={d.url}>{d.name}</a>}</p>
					))}
				</>
			)}
		</div>
	);
};

export default Downloads;
