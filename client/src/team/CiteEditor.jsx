import React from 'react';
import PropTypes from 'prop-types';
import { Controller, useWatch } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faTrash,
	faAngleUp,
	faAngleDown,
} from '@fortawesome/free-solid-svg-icons';
import MDEditor, { commands } from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';

import { useDeviceDetect } from '../helpers/mobile.js';

import styles from './CiteEditor.module.css';

const CiteEditor = ({ item, index, register, control, remove }) => {
	const cites = useWatch({ name: 'cites', control });
	const { isMobile } = useDeviceDetect();

	return (
		<div key={item.id} className={isMobile ? styles.mobile : undefined}>
			<div className={styles.citetitle}>
				<div>
					<label htmlFor={`cites.${index}.title`}>Cite Title</label>
					<input
						id={`cites.${index}.title`}
						maxLength={255}
						{...register(`cites.${index}.title`)}
						type="text"
						defaultValue={cites?.[index]?.title}
					/>
				</div>
				<span className={styles.caret}>
					<Controller
						control={control}
						name={`cites.${index}.open`}
						render={({ field: { onChange, value } }) => (
							<label htmlFor={`cites.${index}.open`}>
								<input
									id={`cites.${index}.open`}
									type="checkbox"
									onChange={(e) => onChange(e.target.checked)}
									checked={value}
								/>
								<FontAwesomeIcon
									icon={cites?.[index]?.open ? faAngleDown : faAngleUp}
								/>
							</label>
						)}
					/>
				</span>
				{remove && (
					<FontAwesomeIcon
						className={styles.trash}
						data-testid="trash"
						icon={faTrash}
						onClick={() => remove(index)}
					/>
				)}
			</div>
			{cites?.[index]?.cites?.charAt(0) === '=' && (
				<p className={styles.syntax}>
					It looks like you&apos;re using outdated wiki syntax from an old
					version of Verbatim! Upgrade Verbatim, let the caselist autodetect
					cites, use the convert button in the editor below, or manually replace
					= with #.
				</p>
			)}
			{cites?.[index]?.open && (
				<Controller
					key={item.id}
					control={control}
					name={`cites.${index}.cites`}
					render={({ field: { onChange, value } }) => (
						<MDEditor
							key={item.id}
							onChange={onChange}
							value={value}
							previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
							commands={[
								{
									...commands.title1,
									name: 'Pocket',
									icon: (
										<div style={{ fontSize: 12, textAlign: 'left' }}>
											Pocket (H1)
										</div>
									),
									buttonProps: { title: 'Pocket', 'aria-label': 'Pocket' },
								},
								commands.divider,
								{
									...commands.title2,
									name: 'Hat',
									icon: (
										<div style={{ fontSize: 12, textAlign: 'left' }}>
											Hat (H2)
										</div>
									),
									buttonProps: { title: 'Hat', 'aria-label': 'Hat' },
								},
								commands.divider,
								{
									...commands.title3,
									name: 'Block',
									icon: (
										<div style={{ fontSize: 12, textAlign: 'left' }}>
											Block (H3)
										</div>
									),
									buttonProps: { title: 'Block', 'aria-label': 'Block' },
								},
								commands.divider,
								{
									...commands.title4,
									name: 'Tag',
									icon: (
										<div style={{ fontSize: 12, textAlign: 'left' }}>
											Tag (H4)
										</div>
									),
									buttonProps: { title: 'Tag', 'aria-label': 'Tag' },
								},
								commands.divider,
								{
									name: 'convert',
									keyCommand: 'convert',
									buttonProps: { 'aria-label': 'Convert' },
									icon: (
										<div style={{ fontSize: 12, textAlign: 'left' }}>
											Convert = to #
										</div>
									),
									execute: (state, api) => {
										// Convert from old XWiki syntax to markdown
										const converted = state.text
											.replace(/==== /g, '#### ')
											.replace(/=== /g, '### ')
											.replace(/== /g, '## ')
											.replace(/= /g, '# ');
										// Manually set textarea range to replace
										// whole contents
										api.setSelectionRange({
											start: 0,
											end: state.text?.length,
										});
										api.replaceSelection(converted);
									},
								},
								commands.divider,
								commands.bold,
								commands.italic,
								commands.link,
							]}
						/>
					)}
				/>
			)}
		</div>
	);
};

CiteEditor.propTypes = {
	item: PropTypes.shape({
		id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	}),
	index: PropTypes.number,
	register: PropTypes.func.isRequired,
	// eslint-disable-next-line react/forbid-prop-types
	control: PropTypes.object.isRequired,
	remove: PropTypes.func,
};

export default CiteEditor;
