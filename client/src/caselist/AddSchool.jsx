import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Controller, useForm } from 'react-hook-form';
import { Combobox } from 'react-widgets';
import { toast } from 'react-toastify';
import { sortBy } from 'lodash';

import { useStore } from '../helpers/store';
import { useAuth } from '../helpers/auth';
import { loadTabroomChapters, addSchool } from '../helpers/api.js';
import { notTitleCase, alphanumericDash } from '../helpers/common.js';

import Error from '../layout/Error';
import Untrusted from '../layout/Untrusted';
import StatesDropdown from './StatesDropdown';

import styles from './AddSchool.module.css';

const AddSchool = () => {
	const auth = useAuth();
	const [, setLocation] = useLocation();
	const { caselist } = useParams();
	const { caselistData, fetchSchools } = useStore();

	const {
		setValue,
		formState: { errors, isSubmitting, isValid },
		handleSubmit,
		reset,
		control,
		watch,
	} = useForm({
		mode: 'all',
		defaultValues: { name: '', state: '' },
	});

	const [fetching, setFetching] = useState(false);
	const [chapters, setChapters] = useState([]);

	const nameRef = useRef();
	useEffect(() => {
		nameRef?.current?.focus();
	}, [nameRef]);

	const name = watch('name');
	const nameWarning =
		name.toLowerCase().includes('school') ||
		name.toLowerCase().includes('academy') ||
		name.toLowerCase().includes('institute') ||
		name.toLowerCase().includes('preparatory');

	const fetchChapters = async () => {
		// Don't refetch on subsequent clicks
		if (chapters.length > 0) {
			return false;
		}
		try {
			setFetching(true);
			let tabroomChapters = (await loadTabroomChapters()) || [];
			tabroomChapters = sortBy(tabroomChapters, 'name');
			setChapters(tabroomChapters);
			setFetching(false);
		} catch (err) {
			setFetching(false);
			setChapters([]);
		}
		return true;
	};

	const addSchoolHandler = async (data) => {
		try {
			const chapter = chapters.find((c) => c.name === data.name);
			const newSchool = await addSchool(caselist, {
				displayName: data.name,
				state: data.state || null,
				chapter_id: chapter?.id || null,
			});
			fetchSchools(caselist);
			reset({}, { keepDefaultValues: true });
			toast.success('Successfully added school');
			setLocation(`/${caselist}/${newSchool.name}`);
		} catch (err) {
			toast.error(`Failed to add school: ${err.message}`);
		}
	};

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
		<div className={styles.instructions}>
			<h1>Create a school on {caselistData.display_name}</h1>
			<p>
				Use the form below to create a new school on the caselist. This is NOT a
				search form, use this only if the school does not yet exist on the
				caselist.
			</p>
			<p>School names should conform to the following rules:</p>
			<ul>
				<li>
					Use the shortest name that uniquely identifies the school, e.g.
					&quot;Lincoln&quot; not &quot;The Lincoln Academy For Very Smart
					Children&quot;
				</li>
				<li>
					Do not include words like &quot;High School&quot;, &quot;HS&quot;,
					&quot;Academy&quot;, &quot;School&quot;, etc. - we know it&apos;s a
					school
				</li>
				<li>
					Use Title Case, e.g. &quot;North Lincoln,&quot; not &quot;north
					lincoln&quot;
				</li>
				<li>Only add one instance of each school</li>
				<li>
					If a school with the same name exists in another state, add your state
					code at the end, like &quot;Lincoln MN&quot;
				</li>
			</ul>

			<p className="error">
				Abusing the wiki (e.g. posting joke schools, using profanity,
				purposefully breaking the above rules, etc.) will not be tolerated and
				may result in banning. Please note that everything you do on the site is
				logged.
			</p>

			<form
				onSubmit={handleSubmit(addSchoolHandler)}
				className="pure-form pure-form-stacked"
			>
				<label htmlFor="name">School Name</label>
				<Controller
					control={control}
					name="name"
					rules={{
						required: true,
						minLength: 3,
						maxLength: 255,
						validate: {
							noHs: (v) =>
								(!v.toLocaleLowerCase().endsWith('hs') &&
									!v.toLocaleLowerCase().endsWith('ms') &&
									!v.toLocaleLowerCase().endsWith('high') &&
									!v.toLocaleLowerCase().endsWith('high school') &&
									!v.toLocaleLowerCase().endsWith('middle school') &&
									!v.toLocaleLowerCase().endsWith('university')) ||
								'Invalid school name, use a short version without a school designation',
							titleCase: (v) =>
								!notTitleCase.test(v) || 'School name should be title case',
							alphanumericDash: (v) =>
								alphanumericDash.test(v) || 'Only letters and numbers allowed',
							length: (v) =>
								v.length === v.trim().length ||
								'No leading/trailing spaces allowed',
						},
					}}
					render={({ field: { value, onChange } }) => (
						<Combobox
							busy={fetching}
							ref={nameRef}
							hideCaret={fetching || chapters.length < 1}
							data={chapters}
							dataKey="id"
							textField={(i) => {
								if (typeof i === 'string') {
									return i;
								}
								return i.name;
							}}
							hideEmptyPopup
							filter="contains"
							value={value}
							onChange={(e) => {
								if (typeof e === 'string') {
									return onChange(e);
								}
								if (e.state) {
									setValue('state', e.state, { shouldValidate: true });
								}
								return onChange(e.name);
							}}
							inputProps={{
								onFocus: fetchChapters,
								id: 'name',
							}}
						/>
					)}
				/>

				<div className="error-small">
					{errors.name?.type === 'required' && <p>This field is required</p>}
					{errors.name?.type === 'minLength' && <p>At least 3 characters</p>}
					{errors.name?.type === 'maxLength' && <p>Max 255 characters</p>}
					{errors.name && <p>{errors.name?.message}</p>}
					{nameWarning && (
						<p>
							Don&apos;t use words like School, Academy, Institute, Preparatory,
							etc.
						</p>
					)}
				</div>

				{caselistData.level === 'hs' && (
					<Controller
						control={control}
						name="state"
						rules={{ required: true }}
						render={({ field: { onChange, value } }) => (
							<>
								<label htmlFor="state">State</label>
								<StatesDropdown
									id="state"
									stateCode={value}
									changeStateCode={onChange}
									required
								/>
							</>
						)}
					/>
				)}
				<div className="error-small">
					{errors.state?.type === 'required' && <p>This field is required</p>}
				</div>

				<button
					type="submit"
					className={`${styles.add} pure-button`}
					disabled={isSubmitting || !isValid}
				>
					Create New School
				</button>
			</form>
		</div>
	);
};

export default AddSchool;
