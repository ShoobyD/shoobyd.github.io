/**
 * The built tower: five tapering mudbrick tiers with limestone cornices, ~700 instanced arches
 * and pilasters (some windows lit), the grand gate at the base, and the helical ramp with torches.
 */
import * as THREE from 'three';
import { TAU, angleDelta, type Random } from './util';
import { BATTER, PARK, R, RAMP_A0, TH, TIERS, Y0, rAt, yb } from './dimensions';
import { archPath, archShape, extrude, instanced, placeAt, placeWall } from './shapes';
import type { Materials } from './materials';
import type { Atmosphere } from './sky';

/** Ramp height and inner edge at progress `t` (0..1) around tier `i`. */
export const rampY = (i: number, t: number) => yb(i) + t * TH;

/**
 * Each tier's turn of the ramp hugs that tier's wall, so where one turn hands over to the next the
 * walls step in (tier `i`'s top to tier `i + 1`'s foot). Over the last share `RAMP_BLEND` of a turn
 * the ramp bends in across the terrace, and over the first share of the next it bends out from the
 * wall, so the two meet halfway between the walls, level, as one unbroken ramp.
 */
const RAMP_BLEND = 0.1;
const rampTop = (i: number) => rAt(i, yb(i + 1));
const rampJoin = (i: number) => (rampTop(i) + R[i + 1]) / 2;
export const rampIn = (i: number, t: number) => {
	let r = rAt(i, rampY(i, t));
	if (i < TIERS - 1) r += (rampJoin(i) - rampTop(i)) * THREE.MathUtils.smoothstep(t, 1 - RAMP_BLEND, 1);
	if (i > 0) r += (rampJoin(i - 1) - R[i]) * (1 - THREE.MathUtils.smoothstep(t, 0, RAMP_BLEND));
	return r - 0.05;
};

/**
 * Where the ramp hands over from one turn to the next it climbs through the cornice at the top of
 * the tier (its top is the terrace floor), so each cornice is cut away along the ramp's path there:
 * over the ramp's width (`RAMP_W`), from just under its walking surface up: to the builders' heads
 * (`HEADROOM`) all the way across, and above that ever further out (`SLOPE` across for each unit
 * up), so the cut's edge on the terrace floor runs out to the cornice's rim in one smooth curve as
 * the ramp sinks below, rather than the whole width dropping out at once. The cornice's shader does
 * the cutting, from the ramp's path sampled across the hand-over (inner edge, height), `NOTCH_SPAN`
 * of a turn either side of it; elsewhere the ramp runs well above or below.
 */
const NOTCH_SPAN = 0.25;
const NOTCH_N = 48;
const RAMP_W = 1.4;
const HEADROOM = 0.6;
/**
 * How far inside a point the ramp's inner edge must be for the point to be cut: as far as it reaches
 * into the wall where it hugs it, so the wall above stays whole there and is cut only where the ramp
 * has left it for the terrace; the cornice and the cut's inner side keep to the same line.
 */
const CUT_IN = 0.1;
const SLOPE = 1.5;

/** The ramp's path through the hand-over at the top of tier `i`: past the summit there's none. */
function notchPath(i: number) {
	return Array.from({ length: NOTCH_N + 1 }, (_, k) => {
		const d = -NOTCH_SPAN + (2 * NOTCH_SPAN * k) / NOTCH_N;
		if (d < 0) return new THREE.Vector2(rampIn(i, 1 + d), rampY(i, 1 + d));
		if (i + 1 < TIERS) return new THREE.Vector2(rampIn(i + 1, d), rampY(i + 1, d));
		return new THREE.Vector2(0, -1e4);
	});
}

/**
 * Cut `material` (a cornice's or a wall's, or its shadow's) along `path`; `y` is the mesh's height.
 * Only where the ramp's inner edge is more than `CUT_IN` inside a point is it cut. Below the
 * cornice's underside (`under`) the cut stands straight up, so the wall's bricks do too; within the
 * cornice it leans out above the builders' heads.
 */
function notched<M extends THREE.Material>(material: M, path: THREE.Vector2[], y: number, under: number) {
	material.onBeforeCompile = (shader) => {
		shader.uniforms.uNotchPath = { value: path };
		shader.uniforms.uNotchY = { value: y };
		shader.uniforms.uNotchUnder = { value: under };
		shader.vertexShader = shader.vertexShader
			.replace('#include <common>', '#include <common>\nuniform float uNotchY;\nvarying vec3 vNotch;\nvarying float vNotchR;')
			.replace('#include <begin_vertex>', '#include <begin_vertex>\nvNotch = transformed + vec3(0.0, uNotchY, 0.0);\nvNotchR = length(transformed.xz);');
		shader.fragmentShader = shader.fragmentShader
			.replace('#include <common>', `#include <common>\nuniform vec2 uNotchPath[${NOTCH_N + 1}];\nuniform float uNotchUnder;\nvarying vec3 vNotch;\nvarying float vNotchR;`)
			.replace(
				'#include <clipping_planes_fragment>',
				/* glsl */ `#include <clipping_planes_fragment>
				{
					float d = mod(atan(vNotch.z, vNotch.x) - ${RAMP_A0.toFixed(6)} + PI, PI2) - PI;
					d /= PI2;
					if (abs(d) < ${NOTCH_SPAN.toFixed(3)}) {
						float f = (d + ${NOTCH_SPAN.toFixed(3)}) / ${(2 * NOTCH_SPAN).toFixed(3)} * ${NOTCH_N.toFixed(1)};
						int k = min(int(f), ${NOTCH_N - 1});
						vec2 p = mix(uNotchPath[k], uNotchPath[k + 1], fract(f));
						// from the vertices' own distances, so it doesn't sag across each flat facet
						float r = vNotchR;
						float h = vNotch.y - p.y;
						float lean = vNotch.y < uNotchUnder ? 0.0 : max(h - ${HEADROOM.toFixed(2)}, 0.0) * ${SLOPE.toFixed(2)};
						float edge = p.x + ${CUT_IN.toFixed(2)} + lean;
						// out to just inside the parapet, so where the ramp's outer face crosses the
						// cornice's the two meet along their own line, not along a second, cut one
						if (h > -0.05 && r > edge && r < p.x + ${(RAMP_W - 0.05).toFixed(2)}) discard;
					}
				}`,
			);
	};
	material.customProgramCacheKey = () => 'ramp-notch';
	return material;
}

/**
 * The cut's inner side at the top of tier `i`: a face along the ramp's inner edge, standing straight
 * up from the ramp to the cornice and within it leaning out above the builders' heads at the cut's
 * slope, up to the terrace floor.
 * Without it the cut would look into the hollow inside the wall and the cornice; with it the wall
 * comes down to meet the ramp. It's swept across the hand-over in rows from the ramp to the floor,
 * so it runs from no height where the ramp comes up level with the floor to the full height below;
 * `clipped` then keeps of it only what lies inside the wall (bricks, up to the cornice's underside at
 * `under`) or the cornice (limestone). It follows the cut's own line, but never stands out of the
 * wall: where that isn't cut it stays just behind it, and where the cut begins it takes over from
 * the wall's face at the same depth.
 */
function cutSide(i: number, path: THREE.Vector2[], floor: number, under: number) {
	// around: the shader's own samples of the ramp's path, and halfway between them, where it
	// interpolates them the same way
	const M = NOTCH_N * 2;
	// up: the line runs straight between where it bends (where it meets the wall's face, the
	// cornice's underside, where it steps out to lean, and the builders' heads), so rows there and at
	// its ends follow it exactly, and no sliver of the cut's edge shows in front of the face
	const J = 5;
	const pos: number[] = [], uv: number[] = [], idx: number[] = [];
	const wallAt = (y: number) => rAt(i, y) - 0.01, lean = (R[i] * BATTER) / TH;
	for (let k = 0; k <= M; k++) {
		const d = -NOTCH_SPAN + (2 * NOTCH_SPAN * k) / M;
		const p = k & 1 ? path[k >> 1].clone().lerp(path[(k >> 1) + 1], 0.5) : path[k >> 1];
		const ri = p.x, y0 = p.y;
		const a = RAMP_A0 + d * TAU, base = Math.min(y0 - 0.05, floor);
		const head = y0 + HEADROOM;
		// below the cornice: straight up, never out of the wall; within it: leaning out over the heads
		const at = (y: number, inCornice: boolean) =>
			inCornice ? ri + CUT_IN + Math.max(y - head, 0) * SLOPE : Math.min(ri + CUT_IN, wallAt(y));
		const rows: [number, boolean][] = [
			[base, base >= under],
			[yb(i) + (R[i] - 0.01 - ri - CUT_IN) / lean, false],
			[under, false],
			[under, true],
			[head, true],
			[floor, true],
		];
		const keys = rows
			.map(([y, c]) => [Math.min(Math.max(y, base), floor), c || Math.min(Math.max(y, base), floor) > under] as [number, boolean])
			.sort((m, n) => m[0] - n[0] || +m[1] - +n[1]);
		for (let j = 0; j <= J; j++) {
			const [y, inCornice] = keys[j];
			// a hair proud of the cut, so its edge falls just behind the face
			const r = at(y, inCornice) + 0.004;
			pos.push(Math.cos(a) * r, y, Math.sin(a) * r);
			// as the wall's own cylinder lays its bricks: around from +z toward +x, and up the tier
			uv.push((Math.PI / 2 - a) / TAU, (y - yb(i)) / TH);
			if (k < M && j < J) {
				const v = k * (J + 1) + j;
				idx.push(v, v + 1, v + J + 1, v + 1, v + J + 2, v + J + 1);
			}
		}
	}
	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
	geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
	geo.setIndex(idx);
	geo.computeVertexNormals();
	return geo;
}

/** Drop `material`'s fragments (at `r` from the axis, `p` in the tower's space) wherever `outside` holds. */
function clipped<M extends THREE.Material>(material: M, outside: string) {
	material.onBeforeCompile = (shader) => {
		shader.vertexShader = shader.vertexShader
			.replace('#include <common>', '#include <common>\nvarying vec3 vClip;')
			.replace('#include <begin_vertex>', '#include <begin_vertex>\nvClip = transformed;');
		shader.fragmentShader = shader.fragmentShader
			.replace('#include <common>', '#include <common>\nvarying vec3 vClip;')
			.replace(
				'#include <clipping_planes_fragment>',
				`#include <clipping_planes_fragment>\n{ vec3 p = vClip; float r = length(p.xz); if (${outside}) discard; }`,
			);
	};
	material.customProgramCacheKey = () => `clip:${outside}`;
	material.side = THREE.DoubleSide;
	return material;
}

/** A closed tube swept through matching rings of points (the ramp's cross-section). */
function sweep(rings: THREE.Vector3[][]) {
	const pos: number[] = [], idx: number[] = [];
	const K = rings[0].length;
	let v = 0;
	for (let f = 0; f < K; f++) {
		const f2 = (f + 1) % K;
		for (const ring of rings) {
			const A = ring[f], B = ring[f2];
			pos.push(A.x, A.y, A.z, B.x, B.y, B.z);
		}
		for (let s = 0; s < rings.length - 1; s++) {
			const a = v + s * 2;
			idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
		}
		v += rings.length * 2;
	}
	const g = new THREE.BufferGeometry();
	g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
	g.setIndex(idx);
	g.computeVertexNormals();
	return g;
}

/**
 * A ring split around gaps: the [thetaStart, thetaLength] runs of a CylinderGeometry that leave
 * out `half` either side of each wall angle in `gaps` (three's theta runs from +z toward +x, so a
 * wall angle `a`, at (cos a, sin a), sits at theta = PI / 2 - a). No gaps: the whole ring.
 */
function bandRuns(gaps: number[], half: number): [number, number][] {
	if (!gaps.length) return [[0, TAU]];
	const at = gaps.map((a) => (((Math.PI / 2 - a) % TAU) + TAU) % TAU).sort((p, q) => p - q);
	return at.map((t, k) => {
		const next = k + 1 < at.length ? at[k + 1] : at[0] + TAU;
		return [t + half, next - t - 2 * half] as [number, number];
	});
}

export function createTower(
	tower: THREE.Group,
	{ rnd }: Random,
	mats: Materials,
	brick: THREE.Texture,
	doorAngles: number[],
) {
	// ---------- walls, cornices and the string course at mid-height ----------
	for (let i = 0; i < TIERS; i++) {
		const r = R[i];
		const tex = brick.clone();
		tex.repeat.set(Math.round((TAU * r) / 7), TH / 3.4);
		tex.needsUpdate = true;
		const mat = new THREE.MeshStandardMaterial({
			map: tex,
			bumpMap: tex,
			bumpScale: 2.2,
			roughness: 0.96,
			color: i % 2 ? 0xead6bd : 0xffffff,
		});
		// the wall and the cornice on it are cut where the ramp climbs through them onto the terrace
		// (the cornice's underside, where the cut stops standing straight and starts to lean)
		const path = notchPath(i), wy = yb(i) + TH / 2, under = yb(i + 1) - 0.3;
		const wall = new THREE.Mesh(new THREE.CylinderGeometry(r * (1 - BATTER), r, TH, 144, 1, true), notched(mat, path, wy, under));
		wall.customDepthMaterial = notched(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }), path, wy, under);
		wall.position.y = wy;
		wall.castShadow = wall.receiveShadow = true;
		const top = r * (1 - BATTER);
		// both the cornice's faces are drawn, so its cut shows its thickness rather than the hollow inside
		const cy = yb(i) + TH - 0.05;
		const stone = notched(mats.limestone.clone(), path, cy, under);
		stone.side = THREE.DoubleSide;
		const cornice = new THREE.Mesh(new THREE.CylinderGeometry(top + 0.42, top + 0.3, 0.5, 144), stone);
		cornice.customDepthMaterial = notched(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }), path, cy, under);
		cornice.position.y = cy;
		cornice.castShadow = cornice.receiveShadow = true;
		const mid = rAt(i, yb(i) + 3) + 0.14;
		tower.add(wall, cornice);
		if (i + 1 < TIERS) {
			// the cut's inner side: bricks up the wall to the cornice, limestone within the cornice
			// (from the step under it), each kept just inside its own, as their faces are flat
			// between the cylinders' vertices
			const side = cutSide(i, path, cy + 0.25, under), f = (n: number) => n.toFixed(4), seam = f(under - 0.001);
			const inWall = `r > ${f(r)} * (1.0 - ${f(BATTER)} * clamp((p.y - ${f(yb(i))}) / ${f(TH)}, 0.0, 1.0)) - 0.002`;
			const bricks = new THREE.Mesh(side, clipped(mat.clone(), `p.y > ${seam} || ${inWall}`));
			const inCornice = `r > mix(${f(top + 0.3)}, ${f(top + 0.42)}, (p.y - ${f(under)}) / 0.5) - 0.006`;
			const lime = new THREE.Mesh(side, clipped(mats.limestone.clone(), `p.y < ${seam} || ${inCornice}`));
			bricks.receiveShadow = lime.receiveShadow = true;
			tower.add(bricks, lime);
		}
		// on the code tier the band stops at each doorway, so it doesn't cross the top of the opening:
		// at its height the arch is narrowing (the opening 0.36 either side, the frame 0.72), and its
		// ends stop between them, hidden in the frame
		for (const [start, length] of bandRuns(i === 1 ? doorAngles : [], 0.55 / mid)) {
			const geo = new THREE.CylinderGeometry(mid, mid, 0.2, Math.max(2, Math.ceil((144 * length) / TAU)), 1, true, start, length);
			const band = new THREE.Mesh(geo, mats.limestone);
			band.position.y = yb(i) + 3.05;
			band.castShadow = true;
			tower.add(band);
		}
	}

	// ---------- arches and pilasters, instanced; gaps are left for the doorways and the gate ----------
	const archLo = extrude(archShape(0.92, 2.05), 0.14);
	const archHi = extrude(archShape(0.74, 1.65), 0.14);
	const pilGeo = new THREE.BoxGeometry(0.3, 1, 0.26);
	const nearDoor = (i: number, a: number, w: number) =>
		(i === 1 && doorAngles.some((d) => Math.abs(angleDelta(a, d)) < w)) ||
		(i === 0 && Math.abs(angleDelta(a, PARK[0].th)) < 0.16);
	const M = { lo: [] as THREE.Matrix4[], loLit: [] as THREE.Matrix4[], hi: [] as THREE.Matrix4[], hiLit: [] as THREE.Matrix4[], pil: [] as THREE.Matrix4[] };
	for (let i = 0; i < TIERS; i++) {
		const n = Math.floor((TAU * R[i]) / 1.9);
		for (let k = 0; k < n; k++) {
			const a = ((k + 0.5) / n) * TAU, ap = (k / n) * TAU;
			const yLo = yb(i) + 0.5, yHi = yb(i) + 3.45;
			if (!nearDoor(i, a, 0.2)) (rnd() < 0.12 ? M.loLit : M.lo).push(placeWall(a, rAt(i, yLo + 1) - 0.07, yLo));
			(rnd() < 0.16 ? M.hiLit : M.hi).push(placeWall(a, rAt(i, yHi + 1) - 0.07, yHi));
			if (!nearDoor(i, ap, 0.17)) M.pil.push(placeWall(ap, rAt(i, yb(i) + 1.4) - 0.08, yb(i) + 1.45, 2.9));
			// the upper one stops under the ramp where the ramp has left the wall to cross the terrace
			const t = (((ap - RAMP_A0) % TAU) + TAU) % TAU / TAU;
			const under = rampIn(i, t) < rAt(i, rampY(i, t)) - 0.1 ? rampY(i, t) - 0.36 : Infinity;
			const pilTop = Math.min(yb(i) + 5.55, under);
			if (pilTop - (yb(i) + 3.15) > 0.2) M.pil.push(placeWall(ap, rAt(i, yb(i) + 4.3) - 0.08, (yb(i) + 3.15 + pilTop) / 2, pilTop - (yb(i) + 3.15)));
		}
	}
	tower.add(
		instanced(archLo, mats.ink, M.lo),
		instanced(archHi, mats.ink, M.hi),
		instanced(archLo, mats.window, M.loLit),
		instanced(archHi, mats.window, M.hiLit),
		instanced(pilGeo, mats.pilaster, M.pil, { cast: true }),
	);

	// ---------- the grand gate at the base, facing the intro camera ----------
	const gate = new THREE.Mesh(extrude(archShape(2.6, 4.3), 0.2), mats.ink);
	gate.applyMatrix4(placeWall(PARK[0].th, R[0] - 0.1, Y0));
	const frameShape = archShape(3.3, 4.75, -0.1);
	frameShape.holes.push(archPath(2.6, 4.3, 0.05));
	const frame = new THREE.Mesh(extrude(frameShape, 0.36), mats.limestone);
	frame.applyMatrix4(placeWall(PARK[0].th, R[0] - 0.12, Y0));
	frame.castShadow = true;
	tower.add(gate, frame);

	// ---------- the helical ramp: one turn per tier, with a parapet and torches on its lip ----------
	const torches: THREE.Matrix4[] = [];
	for (let i = 0; i < TIERS; i++) {
		const rings: THREE.Vector3[][] = [];
		const segs = 200;
		for (let s = 0; s <= segs; s++) {
			const t = s / segs, a = RAMP_A0 + t * TAU, y = rampY(i, t), ri = rampIn(i, t), ro = ri + 1.4;
			const P = (r: number, yy: number) => new THREE.Vector3(Math.cos(a) * r, yy, Math.sin(a) * r);
			rings.push([P(ri, y), P(ro - 0.17, y), P(ro - 0.17, y + 0.4), P(ro, y + 0.4), P(ro, y - 0.34), P(ri, y - 0.34)]);
		}
		const ramp = new THREE.Mesh(sweep(rings), mats.ramp);
		ramp.castShadow = ramp.receiveShadow = true;
		tower.add(ramp);
		for (let t = 0.03; t < 1; t += 0.045) {
			const a = RAMP_A0 + t * TAU, ro = rampIn(i, t) + 1.4 - 0.09;
			torches.push(placeAt(Math.cos(a) * ro, rampY(i, t) + 0.58, Math.sin(a) * ro));
		}
	}
	tower.add(instanced(new THREE.SphereGeometry(0.06, 8, 6), mats.torch, torches));

	const windowBase = new THREE.Color(1, 0.58, 0.22);
	const torchBase = new THREE.Color(2.2, 0.95, 0.3);
	return {
		/** Windows and torches brighten as the sky darkens. */
		update(atmo: Atmosphere) {
			mats.window.color.copy(windowBase).multiplyScalar(atmo.windowGlow);
			mats.torch.color.copy(torchBase).multiplyScalar(0.25 + atmo.windowGlow * 0.9);
		},
	};
}

