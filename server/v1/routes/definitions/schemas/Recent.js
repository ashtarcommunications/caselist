const Recent = {
	type: 'object',
	properties: {
		team_id: { type: 'integer', minimum: 1 },
		side: { type: 'string' },
		tournament: { type: 'string' },
		round: { type: 'string' },
		opponent: { type: 'string' },
		opensource: { type: 'string' },
		team_name: { type: 'string' },
		team_display_name: { type: 'string' },
		school_name: { type: 'string' },
		school_display_name: { type: 'string' },
		updated_at: { type: 'string' },
	},
};

export default Recent;
