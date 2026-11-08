/**
 * Renders the tower still for the static page (see src/components/home/StaticTower.astro): one
 * picture of the whole tower, every tier's point of interest turned to face the front, standing on
 * a patch of its ground that fades out all round, on a transparent background; plus where each
 * tier's focus sits in it.
 *
 * It drives the live 3D scene in Chrome against the dev server. To turn every point of interest to
 * the front, this browser alone gets a rewritten scene/dimensions.ts in which all the camera parks
 * share one angle (the doors, sphere, letters, strings, portrait and cranes are all placed by their
 * tier's park angle); the site's own code is untouched. Two frames on a green screen (no sky,
 * clouds or fog), keyed out: the tower alone, and the tower on its ground (the plain, the paving,
 * houses and trees); the ground is kept only in a soft patch round the tower's foot.
 *
 * Usage: start the dev server (npm run dev), then
 *   node scripts/render-tower-still.mjs [--url http://localhost:4321/] [--chrome <path to Chrome>]
 * Writes src/assets/images/tower-front.webp (high quality, with alpha; the page serves smaller
 * sizes) and src/data/tower-front.json. Re-run it whenever the tower changes.
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
/**
 * Rendered at 1200×2160 CSS px, twice that in pixels, so the page can zoom in and stay sharp. The
 * view reaches from just over the cranes down below the tower's foot, for the ground.
 */
const W = 1200, H = 2160, DPR = 2;
/** From far away and nearly orthographic, so the tiers keep their proportions. */
const DIST = 150, FOV = 22.1, CAMERA_Y = 26.2, LOOK_Y = 15.3;

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

	// set the scene apart: what stands on the tower, what is its ground, and what goes either way
	await page.evaluate((FRONT, DIST, FOV, CAMERA_Y, LOOK_Y) => {
		const { camera, scene, tower } = window.__tower;
		const v = camera.position.clone();
		window.__ground = [];
		scene.traverse((o) => {
			if (!(o.isMesh || o.isSprite || o.isPoints || o.isLine)) return;
			for (let up = o; up; up = up.parent) if (up === tower) return;
			o.getWorldPosition(v);
			const bound = o.geometry?.boundingSphere?.radius ?? 0;
			const sky = o.material?.type === 'ShaderMaterial' && bound > 1000;
			const cloud = o.isSprite && o.scale.x > 10;
			// the ground: the plains (huge flat planes), the paving at the foot, the houses and trees
			// (instanced, so their own position sits at the centre)
			const ground = !sky && !cloud && v.y <= 0.05 && (o.geometry?.type === 'PlaneGeometry' || o.geometry?.type === 'CylinderGeometry' || o.isInstancedMesh);
			const far = Math.hypot(v.x, v.z) > 22 || v.y < 0.6 || bound > 60;
			if (ground) window.__ground.push(o);
			if (far || cloud || sky) o.visible = false;
		});
		let Color = null;
		scene.traverse((o) => { if (!Color && o.material?.color) Color = o.material.color.constructor; });
		scene.fog = null;
		scene.background = new Color(0, 1, 0);
		camera.fov = FOV;
		camera.near = 1;
		const pos = camera.position.clone().set(Math.cos(FRONT) * DIST, CAMERA_Y, Math.sin(FRONT) * DIST);
		const look = camera.position.clone().set(0, LOOK_Y, 0);
		window.__tower.setDirector({ update: () => ({ pos, look, blend: 1, altitude: 0.45 }) });
	}, FRONT, DIST, FOV, CAMERA_Y, LOOK_Y);
	await wait(2500);

	// where each focus lands, and where the tower meets the ground in front, as the camera draws them
	const marks = await page.evaluate((FRONT, FOCUS_Y) => {
		const { camera } = window.__tower;
		const v = camera.position.clone();
		const at = (r, y) => (1 - v.set(Math.cos(FRONT) * r, y, Math.sin(FRONT) * r).project(camera).y) / 2;
		return { foci: FOCUS_Y.map((y) => at(12, y)), foot: at(15, 0) };
	}, FRONT, FOCUS_Y);
	const towerShot = await page.screenshot({ encoding: 'base64' });
	await page.evaluate(() => window.__ground.forEach((o) => (o.visible = true)));
	await wait(1500);
	const groundShot = await page.screenshot({ encoding: 'base64' });

	// key both frames, keep the ground in a soft patch round the foot, and trim to what is left
	const out = await page.evaluate(async (towerSrc, groundSrc, foot) => {
		const load = async (src) => {
			const img = new Image();
			await new Promise((ok) => { img.onload = ok; img.src = src; });
			const c = document.createElement('canvas');
			c.width = img.width;
			c.height = img.height;
			const g = c.getContext('2d');
			g.drawImage(img, 0, 0);
			return { c, g, d: g.getImageData(0, 0, c.width, c.height) };
		};
		/**
		 * Keys out the green: how much of each pixel is screen, and the colour left once the screen is
		 * taken out of it (so the letters' glow, half see-through, comes out warm rather than green);
		 * the screen isn't perfectly even, so anything within a fifth of its green counts as screen.
		 */
		const key = (a) => {
			const bg = [a[0], a[1], a[2]];
			const bgSpill = bg[1] - Math.max(bg[0], bg[2]);
			for (let i = 0; i < a.length; i += 4) {
				const spill = a[i + 1] - Math.max(a[i], a[i + 2]);
				if (spill <= 4) continue;
				const alpha = Math.max(0, Math.min(1, 1 - spill / (bgSpill * 0.8)));
				if (alpha < 0.03) {
					a[i + 3] = 0;
					continue;
				}
				for (let k = 0; k < 3; k++) a[i + k] = Math.max(0, Math.min(255, (a[i + k] - (1 - alpha) * bg[k]) / alpha));
				a[i + 3] = Math.round(alpha * 255);
			}
		};
		const t = await load(towerSrc);
		const g = await load(groundSrc);
		key(t.d.data);
		key(g.d.data);
		const W = g.c.width, H = g.c.height;
		// the patch: an ellipse round the foot, reaching up behind the base far enough for the paving
		// round it, and a short way down in front, fading out towards its edge
		const cx = W / 2, cy = foot * H, rx = W * 0.52, up = H * 0.075, down = Math.min(H - cy, H * 0.13);
		const a = g.d.data, ta = t.d.data;
		let top = H, bottom = 0, left = W, right = 0;
		for (let y = 0; y < H; y++) {
			for (let x = 0; x < W; x++) {
				const i = (y * W + x) * 4;
				const dy = (y - cy) / (y < cy ? up : down);
				const d = Math.hypot((x - cx) / rx, dy);
				const s = Math.min(1, Math.max(0, (d - 0.45) / 0.55));
				const patch = 1 - s * s * (3 - 2 * s);
				// the tower wherever it stands, the ground only inside the patch
				const towerA = ta[i + 3] / 255;
				const alpha = Math.max(towerA, (a[i + 3] / 255) * patch);
				if (towerA >= 0.99) for (let k = 0; k < 3; k++) a[i + k] = ta[i + k];
				a[i + 3] = Math.round(alpha * 255);
				if (a[i + 3] > 12) {
					if (y < top) top = y;
					if (y > bottom) bottom = y;
					if (x < left) left = x;
					if (x > right) right = x;
				}
			}
		}
		g.g.putImageData(g.d, 0, 0);
		const trim = document.createElement('canvas');
		trim.width = right - left + 1;
		trim.height = bottom - top + 1;
		trim.getContext('2d').drawImage(g.c, -left, -top);
		return { url: trim.toDataURL('image/webp', 0.92), top, height: H, w: trim.width, h: trim.height };
	}, `data:image/png;base64,${towerShot}`, `data:image/png;base64,${groundShot}`, marks.foot);

	fs.writeFileSync(IMAGE, Buffer.from(out.url.split(',')[1], 'base64'));
	const foci = marks.foci.map((y) => Number(((y * out.height - out.top) / out.h).toFixed(4)));
	const data = { width: out.w, height: out.h, foci };
	fs.writeFileSync(DATA, `${JSON.stringify(data, null, '\t').replace(/\n/g, '\r\n')}\r\n\r\n`);
	console.log(`${path.relative(ROOT, IMAGE)}: ${out.w}×${out.h}; foci ${foci.join(' ')}`);
} finally {
	await browser.close();
}

