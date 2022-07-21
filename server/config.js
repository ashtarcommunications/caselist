import { config as envconfig } from 'dotenv';
import { cwd } from 'process';

envconfig();

// Default (Dev config)
const config = {
    PORT: 10010,
    SLOWDOWN_RATE_WINDOW: 15 * 60 * 1000,
    SLOWDOWN_RATE_AFTER: 1000,
    SLOWDOWN_RATE_DELAY: 500,
    SLOWDOWN_MAX_DELAY: 100000,
    GET_RATE_WINDOW: 15 * 60 * 1000,
    GET_RATE_MAX: 1500,
    MODIFICATION_RATE_WINDOW: 60 * 1000,
    MODIFICATION_RATE_MAX: 5,
    SUPER_MODIFICATION_RATE_WINDOW: 1440 * 60 * 1000,
    SUPER_MODIFICATION_RATE_MAX: 100,
    DB_HOST: 'localhost',
    DB_PORT: '3306',
    DB_USER: 'username',
    DB_PASS: 'password',
    DB_DATABASE: 'caselist',
    DB_CONNECTION_LIMIT: 50,
    DB_CONNECTION_TIMEOUT: 60000,
    DB_RETRIES: 5,
    DB_RETRY_DELAY: 100,
    LDAP_URL: 'ldaps://localhost:6363',
    TABROOM_API_URL: 'http://localhost:10011/v1', // No trailing slash
    TABROOM_CASELIST_KEY: 'caselist-key',
    S3_BUCKET: 'caselist-files',
    UPLOAD_DIR: `${cwd()}/uploads`, // No trailing slash
    SOLR_QUERY_URL: `http://solr:8983/solr/caselist/select?`, // Trailing ?
    SOLR_UPDATE_URL: 'http://solr:8983/solr/caselist/update?commit=true',
    TIKA_URL: 'http://tika:9998/tika', // Assumes running on same docker-compose network
    TIKA_META_URL: 'http://tika:9998/meta', // Assumes running on same docker-compose network
    REBUILD_SOLR: false,
    ADMINS: [1],
};

if (process.env.NODE_ENV === 'production') {
    config.LDAP_URL = 'ldaps://ldap.tabroom.com:636';
    config.TABROOM_API_URL = 'https://www.tabroom.com/v1';
}

// Override any config value if corresponding env var is set
const configKeys = Object.keys(config);
const envKeys = Object.keys(process.env);

configKeys.forEach((key) => {
    if (envKeys.includes(key)) {
        config[key] = process.env[key];
    }
    if (config[key] === 'true') { config[key] = true; }
    if (config[key] === 'false') { config[key] = false; }

    // ADMINS is a json string in .env, so convert if necessary
    if (!Array.isArray(config.ADMINS)) {
        try {
            config.ADMINS = JSON.parse(config.ADMINS);
        } catch (err) {
            config.ADMINS = [];
        }
    }
});

export default config;
