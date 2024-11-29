import { displaySide, roundName } from '@speechanddebate/nsda-js-utils';
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'wouter';

import { loadRecent } from '../helpers/api.js';
import { useStore } from '../helpers/store';

import DownloadFile from '../helpers/DownloadFile';
import Breadcrumbs from '../layout/Breadcrumbs';
import Loader from '../loader/Loader';
import Error from '../layout/Error';

const Recent = () => {
	const [rounds, setRounds] = useState([]);
	const [fetching, setFetching] = useState(false);

	const { caselist } = useParams();

	const { caselistData } = useStore();

	useEffect(() => {
		const fetchData = async () => {
			try {
				if (caselist) {
					setFetching(true);
					const response = await loadRecent(caselist);
					setRounds(response || []);
					setFetching(false);
				}
			} catch (err) {
				setFetching(false);
				setRounds([]);
			}
		};
		fetchData();
	}, [caselist]);

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
			<h1>Recently Modified in {caselistData.display_name}</h1>
			{!fetching && rounds.length === 0 && <p>No recent modifications</p>}
			{rounds.map((r) => (
				<p key={r.round_id}>
					<Link to={`/${caselist}/${r.school_name}/${r.team_name}`}>
						<span>{r.team_display_name}</span>
						{r.tournament && (
							<>
								<span> - {r.tournament} </span>
								<span>{roundName(r.round)} </span>
								<span>{displaySide(r.side, caselistData.event)} </span>
								{r.opponent && <span>vs {r.opponent}</span>}
							</>
						)}
					</Link>
					{r.opensource && <DownloadFile path={r.opensource} />}
				</p>
			))}
		</div>
	);
};

export default Recent;
