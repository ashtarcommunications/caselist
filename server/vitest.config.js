// eslint-disable-next-line import/no-unresolved
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        threads: false,
        globals: true,
        globalSetup: './tests/globalTestSetup.js',
        coverage: {
            reporter: ['text', 'html'],
            exclude: [
                'node_modules/',
                'src/setupTests.jsx',
            ],
        },
    },
});
