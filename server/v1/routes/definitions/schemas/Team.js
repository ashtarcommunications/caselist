const Team = {
	type: 'object',
	properties: {
		name: { type: 'string' },
		display_name: { type: 'string' },
		notes: { type: 'string' },
		debater1_first: { type: 'string' },
		debater1_last: { type: 'string' },
		debater1_student_id: { type: 'integer' },
		debater2_first: { type: 'string' },
		debater2_last: { type: 'string' },
		debater2_student_id: { type: 'integer' },
		debater3_first: { type: 'string' },
		debater3_last: { type: 'string' },
		debater3_student_id: { type: 'integer' },
		debater4_first: { type: 'string' },
		debater4_last: { type: 'string' },
		debater4_student_id: { type: 'integer' },
	},
};

export default Team;
