const Round = {
    type: 'object',
    properties: {
        side: { type: 'string' },
        tournament: { type: 'string' },
        round: { type: 'string' },
        opponent: { type: 'string' },
        judge: { type: 'string' },
        report: { type: 'string' },
        tourn_id: { type: 'integer' },
        external_id: { type: 'integer' },
    },
};

export default Round;
