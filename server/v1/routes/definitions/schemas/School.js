import { alphanumericDash } from '../formats.js';

const School = {
	type: 'object',
	required: ['displayName'],
	properties: {
		name: { type: 'string', maxLength: 255, format: alphanumericDash },
		displayName: { type: 'string', format: alphanumericDash },
		state: { type: 'string', minLength: 2, maxLength: 2, nullable: true },
	},
};

export default School;
