/**
 * Renders the pictures of the tower for the static page (see src/components/home/StaticTower.astro):
 * - the tower: the whole tower, every tier's point of interest turned to face the
 *   front, on a transparent background, plus where each tier's focus sits in it;
 * - its ground: a band of the plain round it (with its houses and trees), seen by the same camera,
 *   made to repeat seamlessly side by side, so the page can lay it across any width under the tower.
 *
 * It drives the live 3D scene in Chrome against the dev server. To turn every point of interest to
 * the front, this browser alone gets a rewritten scene/dimensions.ts in which all the camera parks
 * share one angle (the doors, sphere, letters, strings, portrait and cranes are all placed by their
 * tier's park angle); the site's own code is untouched. Both are drawn on a green screen (no sky,
 * clouds or fog) and keyed out. Same camera, same pixels: the ground lines up with the tower by
 * the rows and columns they share in the frame.
 *
 * Usage: start the dev server (npm run dev), then
 *   node scripts/render-tower-still.mjs [--url http://localhost:4321/] [--chrome <path to Chrome>]
 * Writes src/assets/images/tower-front.webp, src/assets/images/tower-ground.webp and
 * src/data/tower-front.json. Re-run it whenever the tower changes.
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
const TOWER_IMAGE = path.join(ROOT, 'src/assets/images/tower-front.webp');
const GROUND_IMAGE = path.join(ROOT, 'src/assets/images/tower-ground.webp');
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
/** The ground band: how far above the foot it starts (it fades in there) and below it ends, in frame heights. */
const BAND_UP = 0.07, BAND_DOWN = 0.16;
/**
 * Where the ground repeats: the tile's two ends are cross-faded over this much (in frame widths),
 * and the tile is cut where both seams fall on bare plain (no house or tree half-faded in them).
 */
const SEAM = 0.08;

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

	// sort the scene: the tower (with what hangs round it), the ground, and the rest; the paving at the
	// foot goes (wider than the frame, and the one thing on the plain that mustn't repeat)
	await page.evaluate((FRONT, DIST, FOV, CAMERA_Y, LOOK_Y) => {
		const { camera, scene, tower } = window.__tower;
		const v = camera.position.clone();
		const sets = { tower: [tower], ground: [] };
		scene.traverse((o) => {
			if (!(o.isMesh || o.isSprite || o.isPoints || o.isLine)) return;
			for (let up = o; up; up = up.parent) if (up === tower) return;
			o.getWorldPosition(v);
			const bound = o.geometry?.boundingSphere?.radius ?? 0;
			const flat = v.y <= 0.05;
			// the plains are huge flat planes; houses and trees are instanced (their position is the centre)
			const ground = flat && (o.geometry?.type === 'PlaneGeometry' || o.isInstancedMesh) && bound < 2000;
			const onTower = !flat && Math.hypot(v.x, v.z) <= 22 && bound <= 60 && !(o.isSprite && o.scale.x > 10);
			if (ground) sets.ground.push(o);
			else if (onTower) sets.tower.push(o);
			else o.visible = false; // sky, clouds, the far plain, anything else
		});
		window.__show = (name) => {
			for (const o of sets.tower) o.visible = name === 'tower';
			for (const o of sets.ground) o.visible = name === 'ground';
		};
		window.__show('tower');
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

	// where each focus lands, and where the tower stands on the ground, as the camera draws them
	const marks = await page.evaluate((FRONT, FOCUS_Y) => {
		const { camera } = window.__tower;
		const v = camera.position.clone();
		const at = (r, y) => (1 - v.set(Math.cos(FRONT) * r, y, Math.sin(FRONT) * r).project(camera).y) / 2;
		return { foci: FOCUS_Y.map((y) => at(12, y)), foot: at(15, 0) };
	}, FRONT, FOCUS_Y);
	const towerShot = await page.screenshot({ encoding: 'base64' });
	await page.evaluate(() => window.__show('ground'));
	await wait(1500);
	const groundShot = await page.screenshot({ encoding: 'base64' });

	const out = await page.evaluate(async (towerSrc, groundSrc, foot, BAND_UP, BAND_DOWN, SEAM) => {
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

		// ---------- the tower: keyed, trimmed to itself ----------
		const t = await load(towerSrc);
		key(t.d.data);
		const W = t.c.width, H = t.c.height;
		let top = H, bottom = 0, left = W, right = 0;
		for (let i = 0; i < t.d.data.length; i += 4) {
			if (t.d.data[i + 3] <= 12) continue;
			const p = i / 4, x = p % W, y = (p / W) | 0;
			if (y < top) top = y;
			if (y > bottom) bottom = y;
			if (x < left) left = x;
			if (x > right) right = x;
		}
		t.g.putImageData(t.d, 0, 0);
		const tower = document.createElement('canvas');
		tower.width = right - left + 1;
		tower.height = bottom - top + 1;
		tower.getContext('2d').drawImage(t.c, -left, -top);

		// ---------- the ground: a band round the foot, fading in at its top, made to repeat ----------
		const g = await load(groundSrc);
		key(g.d.data);
		g.g.putImageData(g.d, 0, 0);
		const footY = Math.round(foot * H);
		const b0 = Math.max(0, footY - Math.round(BAND_UP * H));
		const b1 = Math.min(H, footY + Math.round(BAND_DOWN * H));
		const band = g.g.getImageData(0, b0, W, b1 - b0);
		const seam = Math.round(SEAM * W), bandH = b1 - b0;
		const src = band.data;
		// how busy each column is: how far its pixels stray from the plain's colour on their row
		const rowColour = [];
		for (let y = 0; y < bandH; y++) {
			const vals = [[], [], []];
			for (let x = 0; x < W; x += 4) for (let k = 0; k < 3; k++) vals[k].push(src[(y * W + x) * 4 + k]);
			rowColour.push(vals.map((v) => v.sort((p, q) => p - q)[v.length >> 1]));
		}
		const busy = new Float64Array(W);
		for (let x = 0; x < W; x++) {
			let sum = 0;
			for (let y = Math.round(bandH * 0.25); y < bandH; y++) {
				const i = (y * W + x) * 4, c = rowColour[y];
				sum += Math.abs(src[i] - c[0]) + Math.abs(src[i + 1] - c[1]) + Math.abs(src[i + 2] - c[2]);
			}
			busy[x] = sum;
		}
		const prefix = new Float64Array(W + 1);
		for (let x = 0; x < W; x++) prefix[x + 1] = prefix[x] + busy[x];
		const span = (x) => prefix[x + seam] - prefix[x];
		// the tile runs from x0 for tileW columns; its seam blends [x0, x0 + seam) with [x0 + tileW, ...)
		let best = { score: Infinity, x0: 0, tileW: W - seam };
		for (let tileW = Math.round(W * 0.55); tileW <= W - seam; tileW += 8) {
			for (let x0 = 0; x0 + tileW + seam <= W; x0 += 8) {
				const score = span(x0) + span(x0 + tileW);
				if (score < best.score) best = { score, x0, tileW };
			}
		}
		const { x0, tileW } = best;
		const tile = new ImageData(tileW, bandH);
		const dst = tile.data;
		for (let y = 0; y < bandH; y++) {
			// the top fades in, as if into the haze where the plain runs off behind the tower
			const fade = Math.min(1, y / (bandH * (BAND_UP / (BAND_UP + BAND_DOWN)) * 0.9));
			const fadeIn = fade * fade * (3 - 2 * fade);
			for (let x = 0; x < tileW; x++) {
				const o = (y * tileW + x) * 4;
				// the first `seam` columns blend from the band's far end into its start, so the tile's
				// last column runs on into its first
				const w = x < seam ? x / seam : 1;
				const a = (y * W + x0 + x) * 4, b = (y * W + x0 + x + tileW) * 4;
				for (let k = 0; k < 4; k++) dst[o + k] = x < seam ? src[b + k] * (1 - w) + src[a + k] * w : src[a + k];
				dst[o + 3] = Math.round(dst[o + 3] * fadeIn);
			}
		}
		const groundCanvas = document.createElement('canvas');
		groundCanvas.width = tileW;
		groundCanvas.height = bandH;
		groundCanvas.getContext('2d').putImageData(tile, 0, 0);
		// the colour the ground carries on with below the band: its last rows, averaged
		let r = 0, gr = 0, bl = 0, n = 0;
		for (let y = bandH - 6; y < bandH; y++) for (let x = 0; x < tileW; x += 3) { const o = (y * tileW + x) * 4; r += dst[o]; gr += dst[o + 1]; bl += dst[o + 2]; n++; }
		const hex = (v) => Math.round(v / n).toString(16).padStart(2, '0');

		return {
			tower: tower.toDataURL('image/webp', 0.92),
			ground: groundCanvas.toDataURL('image/webp', 0.9),
			frame: { width: W, height: H },
			trim: { top, left, width: tower.width, height: tower.height },
			band: { top: b0, height: bandH, width: tileW, left: x0 },
			below: `#${hex(r)}${hex(gr)}${hex(bl)}`,
		};
	}, `data:image/png;base64,${towerShot}`, `data:image/png;base64,${groundShot}`, marks.foot, BAND_UP, BAND_DOWN, SEAM);

	fs.writeFileSync(TOWER_IMAGE, Buffer.from(out.tower.split(',')[1], 'base64'));
	fs.writeFileSync(GROUND_IMAGE, Buffer.from(out.ground.split(',')[1], 'base64'));
	const { trim, band, frame } = out;
	const r4 = (v) => Number(v.toFixed(4));
	const data = {
		width: trim.width,
		height: trim.height,
		foci: marks.foci.map((y) => r4((y * frame.height - trim.top) / trim.height)),
		axis: r4((frame.width / 2 - trim.left) / trim.width),
		ground: {
			width: band.width,
			height: band.height,
			top: r4((band.top - trim.top) / trim.height),
			axis: r4((frame.width / 2 - band.left) / band.width),
			below: out.below,
		},
	};
	fs.writeFileSync(DATA, `${JSON.stringify(data, null, '\t').replace(/\n/g, '\r\n')}\r\n\r\n`);
	console.log(`tower ${trim.width}×${trim.height}, ground ${band.width}×${band.height}; foci ${data.foci.join(' ')}; ground top ${data.ground.top}`);
} finally {
	await browser.close();
}

