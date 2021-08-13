import schemas from './definitions/schemas';
import responses from './definitions/responses';

const apiDoc = {
    openapi: '3.0.2',
    servers: [{ url: '/v1' }],
    info: {
        title: 'Caselist API v1',
        version: '1.0.0',
    },
    components: {
        schemas,
        responses,
        securitySchemes: { cookie: { type: 'apiKey', in: 'cookie', name: 'caselist_token' } },
    },
    paths: {},
    security: [{ cookie: [] }],
};

export default apiDoc;
