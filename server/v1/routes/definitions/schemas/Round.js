const Round = {
    type: 'object',
    properties: {
        tournament: { type: 'string' },
        side: { type: 'string' },
        round: { type: 'string' },
        opponent: { type: 'string', nullable: true },
        judge: { type: 'string', nullable: true },
        report: { type: 'string', nullable: true },
        tourn_id: { type: 'integer', nullable: true },
        external_id: { type: 'integer', nullable: true },
    },
};

export default Round;
