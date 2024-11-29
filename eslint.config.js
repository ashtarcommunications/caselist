import { configs } from '@speechanddebate/eslint-config-nsda';

export default [
	...configs.react,
	{
		rules: {
			'react/no-unstable-nested-components': 0, // Commonly used for react-table
			'react/destructuring-assignment': 0, // Commonly used for react-table
			'react/jsx-props-no-spreading': 0, // Used for react-hook-form
		},
	},
];
