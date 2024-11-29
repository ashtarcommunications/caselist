import React from 'react';
import PropTypes from 'prop-types';

const StatesDropdown = ({
	name = 'state',
	id = 'state',
	emptyOptionText = '',
	required = true,
	stateCode = '',
	changeStateCode,
}) => {
	const stateList = [
		{ code: 'AL', name: 'Alabama' },
		{ code: 'AK', name: 'Alaska' },
		// { code: 'AS', name: 'American Samoa' },
		{ code: 'AZ', name: 'Arizona' },
		{ code: 'AR', name: 'Arkansas' },
		{ code: 'CA', name: 'California' },
		{ code: 'CO', name: 'Colorado' },
		{ code: 'CT', name: 'Connecticut' },
		{ code: 'DE', name: 'Delaware' },
		{ code: 'DC', name: 'District Of Columbia' },
		// { code: 'FM', name: 'Federated States Of Micronesia' },
		{ code: 'FL', name: 'Florida' },
		{ code: 'GA', name: 'Georgia' },
		// { code: 'GU', name: 'Guam' },
		{ code: 'HI', name: 'Hawaii' },
		{ code: 'ID', name: 'Idaho' },
		{ code: 'IL', name: 'Illinois' },
		{ code: 'IN', name: 'Indiana' },
		{ code: 'IA', name: 'Iowa' },
		{ code: 'KS', name: 'Kansas' },
		{ code: 'KY', name: 'Kentucky' },
		{ code: 'LA', name: 'Louisiana' },
		{ code: 'ME', name: 'Maine' },
		// { code: 'MH', name: 'Marshall Islands' },
		{ code: 'MD', name: 'Maryland' },
		{ code: 'MA', name: 'Massachusetts' },
		{ code: 'MI', name: 'Michigan' },
		{ code: 'MN', name: 'Minnesota' },
		{ code: 'MS', name: 'Mississippi' },
		{ code: 'MO', name: 'Missouri' },
		{ code: 'MT', name: 'Montana' },
		{ code: 'NE', name: 'Nebraska' },
		{ code: 'NV', name: 'Nevada' },
		{ code: 'NH', name: 'New Hampshire' },
		{ code: 'NJ', name: 'New Jersey' },
		{ code: 'NM', name: 'New Mexico' },
		{ code: 'NY', name: 'New York' },
		{ code: 'NC', name: 'North Carolina' },
		{ code: 'ND', name: 'North Dakota' },
		// { code: 'MP', name: 'Northern Mariana Islands' },
		{ code: 'OH', name: 'Ohio' },
		{ code: 'OK', name: 'Oklahoma' },
		{ code: 'OR', name: 'Oregon' },
		// { code: 'PW', name: 'Palau' },
		{ code: 'PA', name: 'Pennsylvania' },
		// { code: 'PR', name: 'Puerto Rico' },
		{ code: 'RI', name: 'Rhode Island' },
		{ code: 'SC', name: 'South Carolina' },
		{ code: 'SD', name: 'South Dakota' },
		{ code: 'TN', name: 'Tennessee' },
		{ code: 'TX', name: 'Texas' },
		{ code: 'UT', name: 'Utah' },
		{ code: 'VT', name: 'Vermont' },
		// { code: 'VI', name: 'Virgin Islands' },
		{ code: 'VA', name: 'Virginia' },
		{ code: 'WA', name: 'Washington' },
		{ code: 'WV', name: 'West Virginia' },
		{ code: 'WI', name: 'Wisconsin' },
		{ code: 'WY', name: 'Wyoming' },
		{ code: 'CN', name: 'China' },
		{ code: 'KR', name: 'Korea' },
		{ code: 'TW', name: 'Taiwan' },
		{ code: 'DR', name: 'Dominican Republic' },
		{ code: 'XX', name: 'International (Other)' },
	];

	return (
		<select
			name={name}
			id={id}
			value={stateCode}
			onChange={changeStateCode}
			required={required}
		>
			<option value="">{emptyOptionText}</option>
			{stateList.map((s) => {
				return (
					<option key={s.code} value={s.code}>
						{s.name}
					</option>
				);
			})}
		</select>
	);
};

StatesDropdown.propTypes = {
	name: PropTypes.string,
	id: PropTypes.string,
	emptyOptionText: PropTypes.string,
	required: PropTypes.bool,
	stateCode: PropTypes.string.isRequired,
	changeStateCode: PropTypes.func.isRequired,
};

export default StatesDropdown;
