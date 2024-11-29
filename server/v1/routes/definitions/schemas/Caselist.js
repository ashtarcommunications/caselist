const Caselist = {
	type: 'object',
	properties: {
		caselist_id: { type: 'integer', minimum: 1 },
		slug: { type: 'string' },
		name: { type: 'string' },
		event: { type: 'string' },
		year: { type: 'integer' },
		archived: { type: 'boolean' },
	},
};

export default Caselist;
