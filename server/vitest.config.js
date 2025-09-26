// eslint-disable-next-line import/no-unresolved
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		threads: false,
		fileParallelism: false,
		globals: true,
		setupFiles: './tests/testSetup.js',
		coverage: {
			reporter: ['text', 'html'],
			exclude: ['node_modules/', 'src/setupTests.jsx'],
		},
	},
});
