const TabroomRound = {
    type: 'object',
    properties: {
        id: { type: 'integer' },
        tournament: { type: 'string' },
        round: { type: 'string' },
        side: { type: 'string' },
        opponent: { type: 'string' },
        judge: { type: 'string' },
        start_time: { type: 'string' },
        share: { type: 'string' },
    },
};

export default TabroomRound;
