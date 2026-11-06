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
export const rampIn = (i: number, t: number) => rAt(i, rampY(i, t)) - 0.05;

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
		const wall = new THREE.Mesh(new THREE.CylinderGeometry(r * (1 - BATTER), r, TH, 144, 1, true), mat);
		wall.position.y = yb(i) + TH / 2;
		wall.castShadow = wall.receiveShadow = true;
		const top = r * (1 - BATTER);
		const cornice = new THREE.Mesh(new THREE.CylinderGeometry(top + 0.42, top + 0.3, 0.5, 144), mats.limestone);
		cornice.position.y = yb(i) + TH - 0.05;
		cornice.castShadow = cornice.receiveShadow = true;
		const mid = rAt(i, yb(i) + 3) + 0.14;
		const band = new THREE.Mesh(new THREE.CylinderGeometry(mid, mid, 0.2, 144, 1, true), mats.limestone);
		band.position.y = yb(i) + 3.05;
		band.castShadow = true;
		tower.add(wall, cornice, band);
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
			M.pil.push(placeWall(ap, rAt(i, yb(i) + 4.3) - 0.08, yb(i) + 4.35, 2.4));
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

