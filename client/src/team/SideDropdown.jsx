import React from 'react';
import PropTypes from 'prop-types';

import { affName, negName } from '@speechanddebate/nsda-js-utils';

const SideDropdown = ({
	id = 'side',
	className,
	value,
	onChange,
	event = 'cx',
}) => {
	return (
		<select
			id={id}
			className={className}
			name="side"
			value={value}
			onChange={onChange}
		>
			{/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
			<option value="" />
			<option value="A">{affName(event)}</option>
			<option value="N">{negName(event)}</option>
		</select>
	);
};

SideDropdown.propTypes = {
	id: PropTypes.string,
	className: PropTypes.string,
	value: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	event: PropTypes.string,
};

export default SideDropdown;
