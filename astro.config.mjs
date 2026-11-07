// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
	site: 'https://shoobyd.github.io',
	trailingSlash: 'always',
	integrations: [vue()],
	redirects: {
		// the old contact page: contact now lives at the tower's summit
		'/contact/': '/#tier-summit',
	},
	i18n: {
		defaultLocale: 'he',
		locales: ['he', 'en'],
		routing: {
			prefixDefaultLocale: false,
		},
	},
	vite: {
		build: {
			// the home page's 3D tower chunk bundles Three.js (~640 kB); it is loaded on demand only
			chunkSizeWarningLimit: 700,
		},
	},
});

