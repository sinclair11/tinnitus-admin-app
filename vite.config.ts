import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import alias from '@rollup/plugin-alias';
import { VitePWA } from 'vite-plugin-pwa';

const projectRootDir = resolve(__dirname);

/**
 * @description Development configuration
 */
const devConfig = {
    plugins: [react(), alias()],
    mode: 'development',
    resolve: {
        alias: {
            '@src': resolve(projectRootDir, 'src'),
            '@components': resolve(projectRootDir, 'src/components'),
            '@pages': resolve(projectRootDir, 'src/pages'),
            '@services': resolve(projectRootDir, 'src/services'),
            '@config': resolve(projectRootDir, 'src/config'),
            '@utils': resolve(projectRootDir, 'src/utils'),
            '@store': resolve(projectRootDir, 'src/store'),
            '@icons': resolve(projectRootDir, 'src/icons'),
        },
    },
};

/**
 * @description Production configuration
 */
const prodConfig = {
    plugins: [
        react(),
        alias(),
        VitePWA({
            includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
            manifest: {
                name: 'Tinnitus CMS',
                short_name: 'CMS',
                description:
                    'Content management system for Tinnitus mobile application to manage content and resources. Other features are statistics and analytics of application usage, users, subscriptions etc.',
                display: 'standalone',
                background_color: '#0a2351',
                theme_color: '#0a2351',
                dir: 'ltr',
                icons: [
                    {
                        src: 'android-chrome-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'android-chrome-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'apple-touch-icon.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                ],
            },
        }),
    ],
    mode: 'production',
    build: {
        outDir: 'build',
    },
    resolve: {
        alias: {
            '@src': resolve(projectRootDir, 'src'),
            '@components': resolve(projectRootDir, 'src/components'),
            '@pages': resolve(projectRootDir, 'src/pages'),
            '@services': resolve(projectRootDir, 'src/services'),
            '@config': resolve(projectRootDir, 'src/config'),
            '@utils': resolve(projectRootDir, 'src/utils'),
            '@store': resolve(projectRootDir, 'src/store'),
            '@icons': resolve(projectRootDir, 'src/icons'),
        },
    },
};

export default defineConfig(({ command }) => {
    if (command === 'build') {
        return prodConfig;
    } else if (command === 'serve') {
        return devConfig;
    }
});
