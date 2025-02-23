import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'wouter';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { displaySide, roundName } from '@speechanddebate/nsda-js-utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { useDeviceDetect } from '../helpers/mobile.js';
import { useAuth } from '../helpers/auth';

import Untrusted from '../layout/Untrusted';

import CiteEditor from './CiteEditor';

import styles from './AddCite.module.css';

const AddCite = ({ rounds, event, handleAddCite }) => {
	const auth = useAuth();
	const { school, team } = useParams();
	const [showForm, setShowForm] = useState();
	const { isMobile } = useDeviceDetect();

	const {
		register,
		formState: { isSubmitting, isValid },
		handleSubmit,
		reset,
		setValue,
		control,
	} = useForm({
		mode: 'all',
		defaultValues: {
			round_id: null,
			cites: [{ title: '', cites: '', open: true }],
		},
	});

	// Use an array for the cite to make reusing the CiteEditor component easier
	const { fields } = useFieldArray({ control, name: 'cites' });
	const cites = useWatch({ name: 'cites', control });

	const toggleShowForm = () => {
		setShowForm(!showForm);
	};

	const handleSubmitCite = async (data) => {
		try {
			handleAddCite(data);
			reset({}, { keepDefaultValues: true });
			// The nested cites field doesn't get reset for some reason, so do it manually
			setValue('cites.0.cites', '');
			setShowForm(false);
		} catch (err) {
			/* empty */
		}
	};

	if (!auth.user?.trusted) {
		return <Untrusted />;
	}

	return (
		<div>
			{showForm ? (
				<>
					<h2>
						Add cites to {school} {team}
					</h2>

					<form
						onSubmit={handleSubmit(handleSubmitCite)}
						className={`pure-form pure-form-stacked ${isMobile ? styles.mobile : undefined}`}
					>
						<label htmlFor="selectround">Link to round</label>
						<select
							id="selectround"
							name="round_id"
							className={styles.selectround}
							{...register('round_id', { required: true })}
						>
							{rounds.map((r) => {
								const name =
									r.tournament === 'All Tournaments'
										? `${r.tournament} ${displaySide(r.side, event)}`
										: `${r.tournament} ${roundName(r.round)} ${displaySide(r.side)} vs ${r.opponent}`;
								return (
									<option key={r.round_id} value={r.round_id}>
										{name}
									</option>
								);
							})}
						</select>
						{fields.map((item, index) => {
							return (
								<CiteEditor
									// eslint-disable-next-line react/no-array-index-key
									key={index}
									item={item}
									index={index}
									register={register}
									control={control}
								/>
							);
						})}

						<div className={styles.buttons}>
							<button
								type="submit"
								className={`pure-button ${styles.add}`}
								disabled={
									isSubmitting ||
									!isValid ||
									cites[0].title?.length < 1 ||
									cites[0].cites?.length < 1
								}
							>
								Add Cite
							</button>
							<button
								type="button"
								className={`pure-button ${styles.cancel}`}
								onClick={toggleShowForm}
							>
								Cancel
							</button>
						</div>
					</form>
				</>
			) : (
				<div
					className={`${styles['add-cite']} ${isMobile ? styles.mobile : undefined}`}
				>
					<button
						type="button"
						className={`pure-button ${styles.add}`}
						onClick={toggleShowForm}
					>
						<FontAwesomeIcon icon={faPlus} />
						<span> Add Cite</span>
					</button>
				</div>
			)}
		</div>
	);
};

AddCite.propTypes = {
	rounds: PropTypes.arrayOf(
		PropTypes.shape({
			round_id: PropTypes.number,
			tournament: PropTypes.string,
			side: PropTypes.string,
			opponent: PropTypes.string,
			round: PropTypes.string,
		}),
	),
	event: PropTypes.string,
	handleAddCite: PropTypes.func,
};

export default AddCite;
