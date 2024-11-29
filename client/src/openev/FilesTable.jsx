import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useParams, Link } from 'wouter';
import { startOfYear } from '@speechanddebate/nsda-js-utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import { campAbbreviations, tagAbbreviations } from '../helpers/common.js';
import { deleteOpenEvFile } from '../helpers/api.js';
import { useAuth } from '../helpers/auth';
import { useStore } from '../helpers/store';

import DownloadFile from '../helpers/DownloadFile';
import ConfirmButton from '../helpers/ConfirmButton';
import Table from '../tables/Table';

import styles from './FilesTable.module.css';

const FilesTable = ({ files }) => {
	const { year } = useParams();
	const { fetchOpenEvFiles } = useStore();
	const auth = useAuth();

	const handleDeleteFile = useCallback(
		async (id) => {
			try {
				toast.dismiss();
				const response = await deleteOpenEvFile(parseInt(id));
				fetchOpenEvFiles();
				toast.success(response.message);
			} catch (err) {
				toast.error(`Failed to delete file: ${err.message}`);
			}
		},
		[fetchOpenEvFiles],
	);

	const handleDeleteFileConfirm = useCallback(
		(e) => {
			const { id } = e.currentTarget;
			if (!id) {
				return false;
			}
			toast.warning(
				({ closeToast }) => (
					<ConfirmButton
						message="Are you sure you want to delete this file?"
						handler={() => handleDeleteFile(id)}
						dismiss={closeToast}
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
		[handleDeleteFile],
	);

	const columns = useMemo(
		() => [
			{
				Header: 'Name',
				accessor: 'name',
				Cell: (row) => {
					return (
						<>
							<DownloadFile path={row.row?.original?.path} text={row.value} />

							{row.row?.original?.year === startOfYear() &&
								auth?.user?.admin && (
									<FontAwesomeIcon
										className={styles.trash}
										title="Delete file"
										icon={faTrash}
										id={row.row?.original?.openev_id}
										onClick={(e) => handleDeleteFileConfirm(e)}
									/>
								)}
						</>
					);
				},
			},
			{
				Header: 'Camp',
				accessor: 'camp',
				Cell: (row) => {
					return (
						<Link to={`/openev/${year || startOfYear()}/${row.value}`}>
							<span>{campAbbreviations[row.value]}</span>
						</Link>
					);
				},
			},
			{
				Header: 'Tags',
				accessor: (row) => {
					// Convert the JSON into a comma delimited list of tags so the table filter can search it
					let tags = '';
					if (!row.tags) {
						return '';
					}
					try {
						const t = JSON.parse(row.tags);
						if (Object.keys(t).length > 0) {
							Object.keys(t)
								?.filter((f) => t[f] === true)
								?.forEach((ft) => {
									tags += `${tagAbbreviations[ft]},`;
								});
						}
					} catch (err) {
						/* empty */
					}
					return tags;
				},
				Cell: (row) => {
					const tags = [];
					if (!row.row?.original?.tags) {
						return false;
					}
					try {
						const t = JSON.parse(row.row?.original?.tags);
						if (Object.keys(t).length > 0) {
							Object.keys(t)
								?.filter((f) => t[f] === true)
								?.forEach((ft) => tags.push(ft));
						}
					} catch (err) {
						/* empty */
					}
					return (
						<p className={styles.tags}>
							{tags.map((t) => (
								<Link key={t} to={`/openev/${year || startOfYear()}/${t}`}>
									<span className={styles.tag}>{tagAbbreviations[t]}</span>
								</Link>
							))}
						</p>
					);
				},
			},
		],
		[year, handleDeleteFileConfirm, auth],
	);

	return (
		<Table columns={columns} data={files} className="table" noDataText="" />
	);
};

FilesTable.propTypes = {
	// eslint-disable-next-line react/forbid-prop-types
	files: PropTypes.array,
};

export default FilesTable;
