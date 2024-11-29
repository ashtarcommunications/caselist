import React from 'react';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';

import Loader from '../loader/Loader';

import styles from './Dropzone.module.css';

const Dropzone = ({ name = 'dropzone', processing, onDrop, control }) => {
	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		multiple: false,
		maxFiles: 1,
		maxSize: 10000000,
		acceptedFiles: '.docx,.doc,.txt,.rtf,.pdf',
	});

	if (processing) {
		return <Loader />;
	}

	return (
		<Controller
			control={control}
			name={name}
			render={({ field: { onChange } }) => (
				<div className={styles.dropzone} {...getRootProps()}>
					<div>
						<input
							{...getInputProps({
								onChange: (e) => onChange(e.target.files[0]),
							})}
						/>
						<p>Drag and drop a file here, or click to select file</p>
					</div>
				</div>
			)}
		/>
	);
};

Dropzone.propTypes = {
	name: PropTypes.string,
	processing: PropTypes.bool,
	onDrop: PropTypes.func.isRequired,
	// eslint-disable-next-line react/forbid-prop-types
	control: PropTypes.object,
};

export default Dropzone;
