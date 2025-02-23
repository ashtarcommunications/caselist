import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Link, useParams, useLocation } from 'wouter';
import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';
import Combobox from 'react-widgets/Combobox';
import Toggle from 'react-toggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { displaySide, roundName } from '@speechanddebate/nsda-js-utils';
import { sortBy } from 'lodash';

import { useStore } from '../helpers/store';
import { useAuth } from '../helpers/auth';

import { addRound, loadTabroomRounds } from '../helpers/api.js';
import { useDeviceDetect } from '../helpers/mobile.js';
import processFile from './processFile.js';

import Error from '../layout/Error';
import Untrusted from '../layout/Untrusted';

import Breadcrumbs from '../layout/Breadcrumbs';
import SideDropdown from './SideDropdown';
import RoundNumberDropdown from './RoundNumberDropdown';
import Dropzone from './Dropzone';
import UploadedFiles from './UploadedFiles';
import CiteEditor from './CiteEditor';

import styles from './AddRound.module.css';

const AddRound = () => {
	const auth = useAuth();
	const { caselist, school, team } = useParams();
	const [location, setLocation] = useLocation();
	const { isMobile } = useDeviceDetect();

	const { caselistData } = useStore();

	const {
		register,
		formState: { errors, isSubmitting, isValid },
		handleSubmit,
		setValue,
		control,
	} = useForm({
		mode: 'all',
		defaultValues: {
			tournament: '',
			side: '',
			round: '',
			opponent: '',
			judge: '',
			report: '',
			autodetect: true,
			opensource: null,
			video: '',
		},
	});
	const { fields, append, remove } = useFieldArray({ control, name: 'cites' });
	const watchFields = useWatch({ control });
	const autodetect = useWatch({ name: 'autodetect', control });

	const [fetchingRounds, setFetchingRounds] = useState(false);
	const [rounds, setRounds] = useState([]);
	const [processing, setProcessing] = useState(false);
	const [files, setFiles] = useState([]);
	const [fileContent, setFileContent] = useState(null);
	const [filename, setFilename] = useState();
	const [invalidCite, setInvalidCite] = useState(false);

	// Have to use a ref to focus the Combobox when used in a Controller
	const tournamentRef = useRef();
	useEffect(() => {
		tournamentRef?.current?.focus();
	}, [tournamentRef]);

	// Calculate a filename for uploaded files
	useEffect(() => {
		const tourn = watchFields.tournament
			?.trim()
			.replaceAll('/', '')
			.replaceAll('\\', '')
			.replaceAll('  ', ' ')
			.replaceAll(' ', '-');
		let computed = `${school}-${team}-`;
		computed += `${displaySide(watchFields.side, caselistData.event)}-`;
		computed += `${tourn}-`;
		computed +=
			watchFields.round === 'All'
				? 'All-Rounds'
				: roundName(watchFields.round).replaceAll(' ', '-');
		setFilename(computed);
	}, [watchFields, school, team, caselistData]);

	// Add a default cite
	// This runs twice and adds 2 default cites in dev mode because of React Strict Mode,
	// but works fine in production
	useEffect(() => {
		if (fields.length < 1) {
			append({ title: '', cites: '', open: true }, { shouldFocus: false });
		}
	}, [append, fields.length]);

	// Check for invalid cites
	useEffect(() => {
		let invalid = false;
		watchFields.cites?.forEach((c) => {
			if ((c.title && !c.cites) || (c.cites && !c.title)) {
				invalid = true;
			}
		});
		setInvalidCite(invalid);
	}, [watchFields]);

	const fetchRounds = async () => {
		// Don't refetch on subsequent clicks
		if (rounds.length > 0) {
			return false;
		}
		try {
			setFetchingRounds(true);
			let slug = location;
			if (slug.endsWith('/add')) {
				slug = slug.slice(0, -4);
			}
			let tabroomRounds = (await loadTabroomRounds(slug)) || [];
			tabroomRounds = sortBy(tabroomRounds, ['tournament', 'round']);
			tabroomRounds.unshift({
				id: 0,
				tournament: 'All Tournaments',
				round: 'All',
				side: 'A',
			});
			setRounds(tabroomRounds);
			setFetchingRounds(false);
		} catch (err) {
			setFetchingRounds(false);
			setRounds([]);
		}
		return true;
	};

	const addRoundHandler = async (data) => {
		if (fileContent) {
			data.opensource = fileContent;

			// Get rid of multiple periods in the filename
			let name = files[0].name || '';
			const numPeriods = name.split('.').length - 1;
			if (numPeriods > 1) {
				const lastPeriod = name.lastIndexOf('.');
				name = name.replaceAll('.', '');
				name = `${name.slice(0, lastPeriod - (numPeriods - 1))}.${name.slice(lastPeriod - (numPeriods - 1))}`;
			}
			data.filename = name;
		} else {
			data.opensource = null;
			data.filename = null;
		}

		// Ignore extra info if using the All Tournaments option
		if (data.tournament === 'All Tournaments') {
			data.round = 'All';
			data.opponent = null;
			data.judge = null;
			data.report = null;
			data.video = null;
		}

		try {
			const response = await addRound(caselist, school, team, data);
			toast.success(response.message);
			setLocation(`/${caselist}/${school}/${team}`);
		} catch (err) {
			toast.error(`Failed to add round: ${err.message}`);
		}
	};

	const handleResetFiles = () => {
		setFiles([]);
		setFileContent(null);
	};

	const removeEmptyCites = useCallback(() => {
		fields.forEach((f, index) => {
			if (f.title === '' && f.cites === '') {
				remove(index);
			}
		});
	}, [fields, remove]);

	const onDrop = useCallback(
		(acceptedFiles) => {
			return processFile(
				acceptedFiles,
				setFiles,
				autodetect,
				removeEmptyCites,
				setProcessing,
				setFileContent,
				append,
			);
		},
		[
			setFiles,
			autodetect,
			removeEmptyCites,
			setProcessing,
			setFileContent,
			append,
		],
	);

	if (caselistData.archived) {
		return (
			<Error message="This caselist is archived, no modifications allowed." />
		);
	}

	if (caselistData.message) {
		return (
			<Error
				statusCode={caselistData.statusCode}
				message={caselistData.message}
			/>
		);
	}

	if (!auth.user?.trusted) {
		return <Untrusted />;
	}

	return (
		<div>
			<Breadcrumbs />

			<h2>
				Add a round to {school} {team}
			</h2>

			<form
				onSubmit={handleSubmit(addRoundHandler)}
				className={`pure-form pure-form-stacked ${isMobile && styles.mobile}`}
			>
				<div>
					<label htmlFor="tournament">Tournament</label>
					<Controller
						control={control}
						name="tournament"
						rules={{ required: true, minLength: 2 }}
						render={({
							field: { onChange, onBlur, value },
							fieldState: { error },
						}) => (
							<Combobox
								id="tournament"
								containerClassName={`${styles.tournament} ${(!value || error) && styles.error}`}
								busy={fetchingRounds}
								ref={tournamentRef}
								hideCaret={fetchingRounds || rounds.length < 1}
								data={rounds}
								dataKey="id"
								textField={(i) => {
									if (typeof i === 'string') {
										return i;
									}
									if (i.tournament === 'All Tournaments') {
										return 'All Tournaments / General Disclosure';
									}
									return `${i.tournament} ${roundName(i.round)} ${displaySide(i.side, caselistData.event)} vs ${i.opponent}`;
								}}
								hideEmptyPopup
								filter="contains"
								value={value}
								onChange={(e) => {
									if (typeof e === 'string') {
										return onChange(e);
									}
									setValue('round', e.round.toString(), {
										shouldValidate: true,
									});
									setValue('side', e.side, { shouldValidate: true });
									setValue('opponent', e.opponent ?? '', {
										shouldValidate: true,
									});
									setValue('judge', e.judge ?? '', { shouldValidate: true });
									return onChange(e.tournament);
								}}
								inputProps={{
									onFocus: fetchRounds,
									onBlur,
								}}
							/>
						)}
					/>
				</div>

				<div>
					<label htmlFor="side">Side</label>
					<Controller
						control={control}
						name="side"
						rules={{ required: true }}
						render={({ field: { onChange, value }, fieldState: { error } }) => (
							<SideDropdown
								id="side"
								className={(!value || error) && styles.error}
								value={value}
								onChange={onChange}
								event={caselistData?.event}
							/>
						)}
					/>
				</div>

				<div>
					<label htmlFor="round">Round</label>
					<Controller
						control={control}
						name="round"
						rules={{ required: true }}
						render={({ field: { onChange, value }, fieldState: { error } }) => (
							<RoundNumberDropdown
								id="round"
								className={(!value || error) && styles.error}
								value={value}
								onChange={onChange}
								disabled={watchFields.tournament === 'All Tournaments'}
							/>
						)}
					/>
				</div>

				<div>
					<label htmlFor="opponent">Opponent</label>
					<input
						name="opponent"
						className={`${styles.opponent} ${errors?.opponent && styles.error}`}
						type="text"
						maxLength={255}
						{...register('opponent')}
						disabled={watchFields.tournament === 'All Tournaments'}
					/>
				</div>

				<div>
					<label htmlFor="judge">Judge</label>
					<input
						name="judge"
						className={styles.judge}
						type="text"
						maxLength={255}
						{...register('judge')}
						disabled={watchFields.tournament === 'All Tournaments'}
					/>
				</div>

				<div>
					<label htmlFor="report">
						Round Report
						<FontAwesomeIcon
							className={styles.info}
							icon={faInfoCircle}
							title="Describe what happened in the round, what arguments were run, what was in rebuttals, etc."
						/>
					</label>
					<textarea
						className={styles.report}
						name="report"
						{...register('report')}
						disabled={watchFields.tournament === 'All Tournaments'}
					/>
				</div>

				<div>
					<label htmlFor="video">
						Video URL
						<FontAwesomeIcon
							className={styles.info}
							icon={faInfoCircle}
							title="Public URL to recording of the round (e.g. YouTube link), if available"
						/>
					</label>
					<input
						name="video"
						className={styles.video}
						type="url"
						maxLength={2000}
						{...register('video')}
						disabled={watchFields.tournament === 'All Tournaments'}
					/>
				</div>

				<hr />
				<h4>Open Source</h4>
				{files.length > 0 ? (
					<UploadedFiles
						files={files}
						filename={filename}
						handleResetFiles={handleResetFiles}
						showFilename={!errors.tournament && !errors.side && !errors.round}
					/>
				) : (
					<>
						<div>
							<label htmlFor="autodetect">
								<p>
									Auto-detect cites (works with{' '}
									<a
										href="https://paperlessdebate.com"
										target="_blank"
										rel="noopener noreferrer"
									>
										Verbatim
									</a>
									)
								</p>
								<Controller
									control={control}
									name="autodetect"
									render={({ field: { onChange, value } }) => (
										<Toggle
											className={styles.switch}
											onChange={onChange}
											checked={value}
											height={20}
											width={40}
											id="autodetect"
											name="autodetect"
											value="yes"
											icons={false}
											aria-label="autodetect"
										/>
									)}
								/>
							</label>
						</div>
						<Dropzone
							name="opensource"
							processing={processing}
							onDrop={onDrop}
							control={control}
						/>
					</>
				)}

				<hr />
				<h4>
					Cites
					<button
						type="button"
						onClick={() =>
							append(
								{ title: '', cites: '', open: false },
								{ shouldFocus: false },
							)
						}
						className={`${styles['add-cite']} pure-button`}
					>
						<FontAwesomeIcon icon={faPlus} />
						<span> Add Cite</span>
					</button>
				</h4>
				<p className={styles.prompt}>
					Please consider adding cites even if you&apos;re also uploading an
					open source document. They&apos;re the best way to see an overview of
					your past arguments and improve the quality of your disclosure.
				</p>
				<p className={styles.prompt}>
					The Cite Title should be the name of the argument, e.g. &quot;Sample
					DA&quot;. The content should give full citation information for each
					card, and can be formatted with
					<a
						href="https://www.markdownguide.org/"
						target="_blank"
						rel="noopener noreferrer"
					>
						{' '}
						markdown{' '}
					</a>
					syntax, such as that produced automatically in
					<a
						href="https://paperlessdebate.com"
						target="_blank"
						rel="noopener noreferrer"
					>
						{' '}
						Verbatim.
					</a>
				</p>
				{fields.map((item, index) => {
					return (
						<CiteEditor
							key={item.id}
							item={item}
							index={index}
							register={register}
							control={control}
							remove={remove}
						/>
					);
				})}

				{invalidCite && (
					<p className={styles.warning}>
						Cite entries must have a title and contents
					</p>
				)}

				<div className={styles.buttons}>
					<button
						type="submit"
						className={`pure-button ${styles.add}`}
						disabled={isSubmitting || !isValid || invalidCite}
					>
						Add Round
					</button>
					<Link to={`/${caselist}/${school}/${team}`}>
						<button type="button" className={`pure-button ${styles.cancel}`}>
							Cancel
						</button>
					</Link>
				</div>
			</form>
		</div>
	);
};

export default AddRound;
