import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import svgr from 'vite-plugin-svgr';

export default defineConfig(() => {
    return {
        build: {
            outDir: 'build',
        },
        plugins: [react(), eslint(), svgr({ svgrOptions: { icon: true } })],
        assetsInclude: ['**/*.md'],
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: './src/setupTests.jsx',
            coverage: {
                reporter: ['text', 'html'],
                exclude: [
                    'node_modules/',
                    'src/setupTests.jsx',
                ],
            },
        },
    };
});
