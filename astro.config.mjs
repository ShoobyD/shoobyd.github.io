// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://shoobyd.github.io',
	trailingSlash: 'always',
	integrations: [
		vue(),
		// sitemap-index.xml (robots.txt points to it): every page with its other-language twin, by the
		// same hreflang codes as the pages' heads. The redirects stay out: they aren't pages.
		sitemap({
			i18n: { defaultLocale: 'he', locales: { he: 'he', en: 'en' } },
			filter: (page) => !['/contact/', '/icmptunnel/'].some((path) => page.endsWith(path)),
		}),
	],
	redirects: {
		// the old contact page: contact now lives at the tower's summit
		'/contact/': '/#tier-summit',
		// icmptunnel has no page of its own any more, only its repo (old links, from the Fresh forum too)
		'/icmptunnel/': 'https://github.com/ShoobyD/icmptunnel',
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

