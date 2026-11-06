// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
	site: 'https://shoobyd.github.io',
	trailingSlash: 'always',
	integrations: [vue()],
	i18n: {
		defaultLocale: 'he',
		locales: ['he', 'en'],
		routing: {
			prefixDefaultLocale: false,
		},
	},
});

