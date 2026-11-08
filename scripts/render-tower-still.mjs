/**
 * Renders the tower still for the static page (see src/components/home/StaticTower.astro): one
 * picture of the whole tower, every tier's point of interest turned to face the front, cut out on
 * a transparent background, plus where each tier's focus sits in it.
 *
 * It drives the live 3D scene in Chrome against the dev server. To turn every point of interest to
 * the front, this browser alone gets a rewritten scene/dimensions.ts in which all the camera parks
 * share one angle (the doors, sphere, letters, strings, portrait and cranes are all placed by their
 * tier's park angle); the site's own code is untouched. The tower is rendered alone (no sky, ground,
 * clouds or fog) on a green screen, which is then keyed out.
 *
 * Usage: start the dev server (npm run dev), then
 *   node scripts/render-tower-still.mjs [--url http://localhost:4321/] [--chrome <path to Chrome>]
 * Writes src/assets/images/tower-front.webp (high-quality, with alpha; the page serves smaller sizes) and src/data/tower-front.json. Re-run it whenever the
 * tower changes.
 */
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const arg = (name, fallback) => {
	const i = process.argv.indexOf(`--${name}`);
	return i > 0 ? process.argv[i + 1] : fallback;
};
const URL = arg('url', 'http://localhost:4321/');
const CHROME = arg('chrome', process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe');
const ROOT = path.resolve(import.meta.dirname, '..');
const IMAGE = path.join(ROOT, 'src/assets/images/tower-front.webp');
const DATA = path.join(ROOT, 'src/data/tower-front.json');

/** The angle every park is turned to: the base's, where the gate is. */
const FRONT = 0.55;
/** Each tier's focus height on the tower's axis: gate, doors, sphere, letters, strings, summit. */
const FOCUS_Y = [3.2, 8.4, 15.6, 21.6, 27.6, 36.2];
/** Rendered at 1200×1800 CSS px, twice that in pixels, so the page can zoom in and stay sharp. */
const W = 1200, H = 1800, DPR = 2;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
	const page = await browser.newPage();
	await page.setRequestInterception(true);
	page.on('request', async (req) => {
		if (!req.url().includes('/src/components/tower/scene/dimensions.ts')) return req.continue();
		const js = await (await fetch(req.url())).text();
		req.respond({ status: 200, contentType: 'application/javascript', body: js.replace(/th: [\d.]+,/g, `th: ${FRONT},`) });
	});
	await page.setViewport({ width: W, height: H, deviceScaleFactor: DPR });
	await page.goto(URL, { waitUntil: 'networkidle0' });
	await page.waitForFunction(() => document.documentElement.classList.contains('webgl') && !document.documentElement.classList.contains('sd-tower-loading'), { timeout: 60000 });
	await page.addStyleTag({ content: '.sd-header,[data-tier-panel],[data-tower-chrome],[data-summit-cue],.sd-footer,astro-dev-toolbar{visibility:hidden!important}' });

	// the scene's handle lives in the tower island's Vue component
	await page.evaluate(() => {
		for (const el of document.querySelectorAll('astro-island')) {
			const app = el.__vue_app__;
			if (!app) continue;
			const walk = (inst, depth) => {
				if (!inst || depth > 6) return;
				if (inst.setupState && 'live' in inst.setupState) window.__tower = inst.setupState.live;
				const visit = (v) => { if (!v) return; if (v.component) walk(v.component, depth + 1); if (Array.isArray(v.children)) v.children.forEach(visit); };
				visit(inst.subTree);
			};
			walk(app._instance, 0);
		}
		if (!window.__tower) throw new Error('tower scene not found');
	});

	// park the climb on the math tier first: the languages tier's letters only gather around the
	// tower while the climb is near them
	await page.evaluate(() => window.scrollTo({ top: document.getElementById('tier-math').offsetTop, behavior: 'instant' }));
	await wait(2500);
	await page.evaluate((FRONT) => {
		const { camera, scene, tower } = window.__tower;
		const v = camera.position.clone();
		// the tower alone: everything not on it and away from its axis goes (sky, ground, houses, clouds)
		scene.traverse((o) => {
			if (!(o.isMesh || o.isSprite || o.isPoints || o.isLine)) return;
			for (let up = o; up; up = up.parent) if (up === tower) return;
			o.getWorldPosition(v);
			const far = Math.hypot(v.x, v.z) > 22 || v.y < 0.6 || (o.geometry?.boundingSphere?.radius ?? 0) > 60;
			if (far || (o.isSprite && o.scale.x > 10)) o.visible = false;
		});
		let Color = null;
		scene.traverse((o) => { if (!Color && o.material?.color) Color = o.material.color.constructor; });
		scene.fog = null;
		scene.background = new Color(0, 1, 0);
		// near-orthographic from far away, so the tiers keep their proportions
		camera.fov = 18.5;
		camera.near = 1;
		const dist = 150, cy = 20.2;
		const pos = camera.position.clone().set(Math.cos(FRONT) * dist, cy + 6, Math.sin(FRONT) * dist);
		const look = camera.position.clone().set(0, cy, 0);
		window.__tower.setDirector({ update: () => ({ pos, look, blend: 1, altitude: 0.45 }) });
	}, FRONT);
	await wait(2500);
	// where each focus lands, projected by the camera as the last frame drew it
	const ys = await page.evaluate((FRONT, FOCUS_Y) => {
		const { camera } = window.__tower;
		const v = camera.position.clone();
		return FOCUS_Y.map((y) => (1 - v.set(Math.cos(FRONT) * 12, y, Math.sin(FRONT) * 12).project(camera).y) / 2);
	}, FRONT, FOCUS_Y);
	const shot = await page.screenshot({ encoding: 'base64' });

	// key out the green (with soft edges and the spill taken out), then trim to the tower
	const keyed = await page.evaluate(async (src) => {
		const img = new Image();
		await new Promise((ok) => { img.onload = ok; img.src = src; });
		const c = document.createElement('canvas');
		c.width = img.width;
		c.height = img.height;
		const g = c.getContext('2d');
		g.drawImage(img, 0, 0);
		const d = g.getImageData(0, 0, c.width, c.height);
		const a = d.data;
		let top = c.height, bottom = 0, left = c.width, right = 0;
		// the screen as it came out (tone mapping lightens it), sampled in a corner
		const bg = [a[0], a[1], a[2]];
		const bgSpill = bg[1] - Math.max(bg[0], bg[2]);
		for (let i = 0; i < a.length; i += 4) {
			const spill = a[i + 1] - Math.max(a[i], a[i + 2]);
			if (spill > 4) {
				// how much of the pixel is screen, and the colour left once the screen is taken out of
				// it (so the letters' glow, half see-through, comes out warm rather than green); the screen
				// isn't perfectly even, so anything within a fifth of its green counts as screen
				const alpha = Math.max(0, Math.min(1, 1 - spill / (bgSpill * 0.8)));
				if (alpha < 0.03) a[i + 3] = 0;
				else {
					for (let k = 0; k < 3; k++) a[i + k] = Math.max(0, Math.min(255, (a[i + k] - (1 - alpha) * bg[k]) / alpha));
					a[i + 3] = Math.round(alpha * 255);
				}
			}
			if (a[i + 3] > 20) {
				const p = i / 4, x = p % c.width, y = (p / c.width) | 0;
				if (y < top) top = y;
				if (y > bottom) bottom = y;
				if (x < left) left = x;
				if (x > right) right = x;
			}
		}
		g.putImageData(d, 0, 0);
		const t = document.createElement('canvas');
		t.width = right - left + 1;
		t.height = bottom - top + 1;
		t.getContext('2d').drawImage(c, -left, -top);
		return { url: t.toDataURL('image/webp', 0.92), top, height: c.height, w: t.width, h: t.height };
	}, `data:image/png;base64,${shot}`);

	fs.writeFileSync(IMAGE, Buffer.from(keyed.url.split(',')[1], 'base64'));
	const foci = ys.map((y) => Number(((y * keyed.height - keyed.top) / keyed.h).toFixed(4)));
	const data = { width: keyed.w, height: keyed.h, foci };
	fs.writeFileSync(DATA, `${JSON.stringify(data, null, '\t').replace(/\n/g, '\r\n')}\r\n\r\n`);
	console.log(`${path.relative(ROOT, IMAGE)}: ${keyed.w}×${keyed.h}; foci ${foci.join(' ')}`);
} finally {
	await browser.close();
}

