/**
 * Renders the image a shared link to the site shows (Open Graph / X card), 1200×630:
 * the live tower at the base's park, under the dawn sky, standing on the inline-end; and in the
 * sky where the panel stands, the name, the role line and the domain with the tower mark, set in
 * the site's own type and lit by its legibility glow (no scrim behind them).
 *
 * It drives the live 3D scene in Chrome against the dev server, waits for the intro dolly to land,
 * hides the page's own interface (header, panels, gauge, footer) and lays the words over it; the
 * site's code is untouched. The words come from the dictionary (src/i18n/ui.ts: `brand.tagline`,
 * `share.role`), read here directly (Node strips its types).
 *
 * Usage: start the dev server (npm run dev), then
 *   node scripts/render-share-image.mjs [--lang he] [--url http://localhost:4321/] [--chrome <path to Chrome>]
 * Writes public/og/<lang>.jpg. Re-run it whenever the tower or the words change.
 */
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { ui } from '../src/i18n/ui.ts';

const arg = (name, fallback) => {
	const i = process.argv.indexOf(`--${name}`);
	return i > 0 ? process.argv[i + 1] : fallback;
};
const LANG = arg('lang', 'he');
const URL = arg('url', LANG === 'he' ? 'http://localhost:4321/' : `http://localhost:4321/${LANG}/`);
const CHROME = arg('chrome', process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe');
const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public/og', `${LANG}.jpg`);

/** The size networks show a large card at. */
const W = 1200, H = 630;
/** The intro dolly takes 3.6 s from the scene's start; this leaves it landed and settled. */
const SETTLE_MS = 5500;
/** JPEG: the 3D render as a PNG is about 1 MB; at this quality it is a fraction of that. */
const QUALITY = 88;

const t = ui[LANG];
const words = { name: t['brand.tagline'], role: t['share.role'], domain: 'shoobyd.github.io' };

// the legibility glow of the site's text over the scene; the domain, smaller and gold over the
// bright clouds, gets a deeper one
const GLOW = '0 1px 2px rgb(20 16 12 / 0.85), 0 0 18px rgb(20 16 12 / 0.6)';
const GLOW_DEEP = '0 1px 3px rgb(20 16 12 / 0.95), 0 0 12px rgb(20 16 12 / 0.85), 0 0 30px rgb(20 16 12 / 0.6)';

const browser = await puppeteer.launch({
	executablePath: CHROME,
	headless: 'new',
	args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
});
try {
	const page = await browser.newPage();
	await page.setViewport({ width: W, height: H });
	await page.goto(URL, { waitUntil: 'networkidle0' });
	await page.waitForFunction(
		() => document.documentElement.classList.contains('webgl') && !document.documentElement.classList.contains('sd-tower-loading'),
		{ timeout: 60000 },
	);
	await new Promise((r) => setTimeout(r, SETTLE_MS));

	await page.evaluate(
		({ words, GLOW, GLOW_DEEP }) => {
			const mark = document.querySelector('.sd-header__brand svg')?.cloneNode(true);
			const hide = document.createElement('style');
			hide.textContent =
				'.sd-header,[data-tier-panel],.gauge,.sd-footer,.sd-skip-link,astro-dev-toolbar{visibility:hidden!important}';
			document.head.append(hide);

			// the words, where the panel stands: the inline-start, in the page's direction
			const box = document.createElement('div');
			box.dir = document.documentElement.dir;
			box.style.cssText =
				'position:fixed;inset:0;z-index:99999;pointer-events:none;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding-inline-start:84px;color:#e9e3d3';
			const name = document.createElement('div');
			name.textContent = words.name;
			name.style.cssText = `font:400 82px/1.04 var(--sd-font-display);text-shadow:${GLOW}`;
			const role = document.createElement('div');
			role.textContent = words.role;
			role.style.cssText = `margin-top:18px;font:600 28px/1.35 var(--sd-font-text);white-space:nowrap;text-shadow:${GLOW}`;
			const domain = document.createElement('div');
			domain.style.cssText = `margin-top:34px;display:flex;align-items:center;gap:12px;font:700 26px var(--sd-font-text);color:#ffd89a;text-shadow:${GLOW_DEEP}`;
			if (mark instanceof SVGElement) {
				mark.setAttribute('width', '36');
				mark.setAttribute('height', '36');
				mark.style.filter = 'drop-shadow(0 1px 3px rgb(20 16 12 / 0.9))';
				domain.append(mark);
			}
			const bdi = document.createElement('bdi');
			bdi.textContent = words.domain;
			domain.append(bdi);
			box.append(name, role, domain);
			document.body.append(box);
		},
		{ words, GLOW, GLOW_DEEP },
	);
	await page.evaluate(() => document.fonts.ready);
	await new Promise((r) => setTimeout(r, 400));

	fs.mkdirSync(path.dirname(OUT), { recursive: true });
	await page.screenshot({ path: OUT, type: 'jpeg', quality: QUALITY });
	console.log(`${path.relative(ROOT, OUT)}: ${W}×${H}, ${Math.round(fs.statSync(OUT).size / 1024)} KB`);
} finally {
	await browser.close();
}

