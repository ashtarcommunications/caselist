import React from 'react';
import PropTypes from 'prop-types';

const RoundNumberDropdown = ({
	id = 'round',
	className,
	value,
	onChange,
	disabled,
}) => {
	return (
		<select
			id={id}
			className={className}
			name="round"
			value={value}
			onChange={onChange}
			disabled={disabled}
		>
			{/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
			<option value="" />
			<option value="All">All</option>
			<option value="1">1</option>
			<option value="2">2</option>
			<option value="3">3</option>
			<option value="4">4</option>
			<option value="5">5</option>
			<option value="6">6</option>
			<option value="7">7</option>
			<option value="8">8</option>
			<option value="9">9</option>
			<option value="Quads">Quads</option>
			<option value="Triples">Triples</option>
			<option value="Doubles">Doubles</option>
			<option value="Octas">Octas</option>
			<option value="Quarters">Quarters</option>
			<option value="Semis">Semis</option>
			<option value="Finals">Finals</option>
		</select>
	);
};

RoundNumberDropdown.propTypes = {
	id: PropTypes.string,
	className: PropTypes.string,
	value: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
};

export default RoundNumberDropdown;
