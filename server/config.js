import { config as envconfig } from 'dotenv';
import { cwd } from 'process';

envconfig();

// Default (Dev config)
const config = {
    PORT: 10010,
    SOLR_QUERY_URL: `http://localhost:8983/solr/caselist/select?`,
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
    LDAP_URL: 'ldap://localhost:6363',
    TABROOM_API_URL: 'http://localhost:10011/v1',
    TABROOM_CASELIST_KEY: 'caselist-key',
    S3_BUCKET: 'caselist-files',
    UPLOAD_DIR: `${cwd()}/uploads`, // No trailing slash
};

if (process.env.NODE_ENV === 'production') {
    config.LDAP_URL = 'ldaps://ldap.tabroom.com:636';
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
});

export default config;
