// @ts-check
import frontEndEditor from 'plugin-front-end-editor';
import { myPlugin } from '@example/my-plugin';

/** @type {import('astro').AstroUserConfig} */
const config = {
	buildOptions: {
		site: 'http://localhost:3000/',
	},
	renderers: ['@astrojs/renderer-react'],
	vite: {
		mergedConfigCallback: (config) => {
			const headPlugins = config.plugins.filter(p => p.beforeAstroPlugins === true);
			const tailPlugins = config.plugins.filter(p => p.beforeAstroPlugins !== true);
			config.plugins = headPlugins.concat(tailPlugins);

			return config;
		},
		plugins: [
			{
				...frontEndEditor({
					include: ['demo/src/**'],
				}),
				beforeAstroPlugins: true,
			},
			{
				...myPlugin(),
				beforeAstroPlugins: true,
			},
		],
	},
};

export default config;
