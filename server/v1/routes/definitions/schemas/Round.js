const Round = {
    type: 'object',
    properties: {
        tournament: { type: 'string' },
        side: { type: 'string' },
        round: { type: 'string' },
        opponent: { type: 'string', nullable: true, maxLength: 255 },
        judge: { type: 'string', nullable: true, maxLength: 255 },
        report: { type: 'string', nullable: true },
        tourn_id: { type: 'integer', nullable: true },
        external_id: { type: 'integer', nullable: true },
    },
};

export default Round;
