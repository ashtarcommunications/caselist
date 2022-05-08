const File = {
    type: 'object',
    properties: {
        openev_id: { type: 'integer', minimum: 1 },
        path: { type: 'string' },
        year: { type: 'integer' },
        camp: { type: 'string' },
        lab: { type: 'string' },
        tags: { type: 'string' },
        deleted: { type: 'boolean' },
        file: { type: 'string' },
        filename: { type: 'string' }
    },
};

export default File;
