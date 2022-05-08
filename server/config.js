import { config as envconfig } from 'dotenv';

envconfig();

// Default (Dev config)
const config = {
    PORT: 10010,
    RATE_WINDOW: 15 * 60 * 1000,
    RATE_MAX: 100000,
    RATE_AFTER: 1000,
    RATE_DELAY: 500,
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
