/**
 * Renders the pictures of the tower for the static page (see src/components/home/StaticTower.astro):
 * - the tower: the whole tower, every tier's point of interest turned to face the front, on a
 *   transparent background, plus where each tier's focus sits in it;
 * - the houses and trees of the plain round it, seen by the same camera, in a band made to repeat
 *   seamlessly side by side, so the page can lay them across any width under the tower;
 * - the plain itself is left to the page (a CSS gradient below a sharp horizon): this records where
 *   that horizon runs and the plain's colours, far and near.
 *
 * It drives the live 3D scene in Chrome against the dev server. To turn every point of interest to
 * the front, this browser alone gets a rewritten scene/dimensions.ts in which all the camera parks
 * share one angle (the doors, sphere, letters, strings, portrait and cranes are all placed by their
 * tier's park angle); the site's own code is untouched. Drawn on a green screen (no sky, clouds or
 * fog) and keyed out. Same camera, same pixels: everything lines up by the rows and columns it
 * shares in the frame.
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
/**
 * The horizon: where the plain meets the sky behind the tower, level with this height on the
 * tower's front (about the first tier's ledge). The camera looks down on the plain from well
 * above it, so the plain runs on behind the tower that far up. Houses and trees standing beyond it
 * are left out, so nothing floats above the plain's edge.
 */
const HORIZON_Y = 6.8;
/** The houses' band: from a little above the horizon (for the roofs there) to this far below the foot. */
const ROOFS = 0.02, BAND_DOWN = 0.16;
/**
 * Where the houses repeat: the tile's two ends are cross-faded over this much (in frame widths),
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

	// sort the scene: the tower (with what hangs round it), the plain, the houses and trees, and the
	// rest; the paving at the foot goes (wider than the frame, and the one thing that mustn't repeat)
	await page.evaluate((FRONT, DIST, FOV, CAMERA_Y, LOOK_Y) => {
		const { camera, scene, tower } = window.__tower;
		const v = camera.position.clone();
		const sets = { tower: [tower], plain: [], houses: [] };
		scene.traverse((o) => {
			if (!(o.isMesh || o.isSprite || o.isPoints || o.isLine)) return;
			for (let up = o; up; up = up.parent) if (up === tower) return;
			o.getWorldPosition(v);
			const bound = o.geometry?.boundingSphere?.radius ?? 0;
			const flat = v.y <= 0.05;
			const onTower = !flat && Math.hypot(v.x, v.z) <= 22 && bound <= 60 && !(o.isSprite && o.scale.x > 10);
			// the plains are huge flat planes; houses and trees are instanced (their position is the centre)
			if (flat && o.isInstancedMesh) sets.houses.push(o);
			else if (flat && o.geometry?.type === 'PlaneGeometry' && bound < 2000) sets.plain.push(o);
			else if (onTower) sets.tower.push(o);
			else o.visible = false; // sky, clouds, the far plain, the paving, anything else
		});
		window.__sets = sets;
		window.__show = (name) => {
			for (const [k, list] of Object.entries(sets)) for (const o of list) o.visible = k === name;
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
	const marks = await page.evaluate((FRONT, FOCUS_Y, HORIZON_Y) => {
		const { camera } = window.__tower;
		const v = camera.position.clone();
		const at = (r, y) => (1 - v.set(Math.cos(FRONT) * r, y, Math.sin(FRONT) * r).project(camera).y) / 2;
		return { foci: FOCUS_Y.map((y) => at(12, y)), foot: at(15, 0), horizon: at(15, HORIZON_Y) };
	}, FRONT, FOCUS_Y, HORIZON_Y);
	const { horizon } = marks;
	const towerShot = await page.screenshot({ encoding: 'base64' });

	// the plain alone, for its colours
	await page.evaluate(() => window.__show('plain'));
	await wait(1200);
	const plainShot = await page.screenshot({ encoding: 'base64' });

	// the houses and trees alone, those standing beyond the horizon put away
	await page.evaluate((horizon) => {
		const { camera } = window.__tower;
		window.__show('houses');
		for (const o of window.__sets.houses) {
			const m = o.matrix.clone();
			const p = camera.position.clone();
			for (let i = 0; i < o.count; i++) {
				o.getMatrixAt(i, m);
				p.setFromMatrixPosition(m).applyMatrix4(o.matrixWorld);
				const y = (1 - p.project(camera).y) / 2;
				if (y < horizon) {
					m.makeScale(0, 0, 0);
					o.setMatrixAt(i, m);
				}
			}
			o.instanceMatrix.needsUpdate = true;
		}
	}, horizon);
	await wait(1500);
	const housesShot = await page.screenshot({ encoding: 'base64' });

	const out = await page.evaluate(async (towerSrc, plainSrc, housesSrc, foot, horizon, ROOFS, BAND_DOWN, SEAM) => {
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

		// ---------- the plain: its colour just under the horizon, and down near the front ----------
		const plain = await load(plainSrc);
		const horizonY = Math.round(horizon * H);
		const b1 = Math.min(H, Math.round((foot + BAND_DOWN) * H));
		const average = (y0, y1) => {
			let r = 0, g = 0, b = 0, n = 0;
			for (let y = y0; y < y1; y++) for (let x = 0; x < W; x += 5) { const i = (y * W + x) * 4; r += plain.d.data[i]; g += plain.d.data[i + 1]; b += plain.d.data[i + 2]; n++; }
			const hex = (v) => Math.round(v / n).toString(16).padStart(2, '0');
			return `#${hex(r)}${hex(g)}${hex(b)}`;
		};
		const far = average(horizonY + 4, horizonY + 24);
		const near = average(b1 - 24, b1);

		// ---------- the houses and trees: a band from the roofs at the horizon down, made to repeat ----------
		const g = await load(housesSrc);
		key(g.d.data);
		const b0 = Math.max(0, horizonY - Math.round(ROOFS * H));
		const band = g.d;
		const seam = Math.round(SEAM * W), bandH = b1 - b0;
		const src = band.data;
		// how busy each column is: how much of it is house or tree
		const busy = new Float64Array(W);
		for (let x = 0; x < W; x++) {
			let sum = 0;
			for (let y = b0; y < b1; y++) sum += src[(y * W + x) * 4 + 3];
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
			for (let x = 0; x < tileW; x++) {
				const o = (y * tileW + x) * 4;
				// the first `seam` columns blend from the band's far end into its start, so the tile's
				// last column runs on into its first
				const w = x < seam ? x / seam : 1;
				const a = ((b0 + y) * W + x0 + x) * 4, b = ((b0 + y) * W + x0 + x + tileW) * 4;
				for (let k = 0; k < 4; k++) dst[o + k] = x < seam ? src[b + k] * (1 - w) + src[a + k] * w : src[a + k];
			}
		}
		const houses = document.createElement('canvas');
		houses.width = tileW;
		houses.height = bandH;
		houses.getContext('2d').putImageData(tile, 0, 0);

		return {
			tower: tower.toDataURL('image/webp', 0.92),
			houses: houses.toDataURL('image/webp', 0.9),
			frame: { width: W, height: H },
			trim: { top, left, width: tower.width, height: tower.height },
			band: { top: b0, height: bandH, width: tileW, left: x0, horizon: horizonY - b0 },
			far,
			near,
		};
	}, `data:image/png;base64,${towerShot}`, `data:image/png;base64,${plainShot}`, `data:image/png;base64,${housesShot}`, marks.foot, horizon, ROOFS, BAND_DOWN, SEAM);

	fs.writeFileSync(TOWER_IMAGE, Buffer.from(out.tower.split(',')[1], 'base64'));
	fs.writeFileSync(GROUND_IMAGE, Buffer.from(out.houses.split(',')[1], 'base64'));
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
			horizon: r4(band.horizon / band.height),
			axis: r4((frame.width / 2 - band.left) / band.width),
			far: out.far,
			near: out.near,
		},
	};
	fs.writeFileSync(DATA, `${JSON.stringify(data, null, '\t').replace(/\n/g, '\r\n')}\r\n\r\n`);
	console.log(`tower ${trim.width}×${trim.height}, houses ${band.width}×${band.height}; foci ${data.foci.join(' ')}; ground ${JSON.stringify(data.ground)}`);
} finally {
	await browser.close();
}

