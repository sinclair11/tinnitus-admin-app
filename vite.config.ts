import { defineConfig, UserConfigExport } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import alias from '@rollup/plugin-alias'

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
      '@utils': resolve(projectRootDir, 'src/utils'),
      '@store': resolve(projectRootDir, 'src/store'),
      '@icons': resolve(projectRootDir, 'src/icons'),
		}
	}
};

/**
 * @description Production configuration
 */
const prodConfig = {
	plugins: [react(), alias()],
	mode: 'production',
	build: {
		outDir: 'build'
	},
	resolve: {
		alias: {
			'@src': resolve(projectRootDir, 'src'),
			'@components': resolve(projectRootDir, 'src/components'),
      '@utils': resolve(projectRootDir, 'src/utils'),
      '@store': resolve(projectRootDir, 'src/store'),
      '@icons': resolve(projectRootDir, 'src/icons'),
		}
	}
};

export default defineConfig(({ command }) => {
	if (command === 'build') {
		return prodConfig;
	} else if (command === 'serve') {
		return devConfig;
	}
})