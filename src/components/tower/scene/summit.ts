/**
 * The unfinished summit: a ragged ring of loose bricks, a floor strewn with more, the limestone
 * plinth (game mode builds on it in step 6c), timber scaffolding and two swinging treadwheel cranes.
 * The whole top is also a way into the game: `pick` tells whether a pointer is over it, and
 * `setHot` lights it softly while one hovers.
 */
import * as THREE from 'three';
import { TAU, clamp, type Random } from './util';
import { PARK, R5, Y5 } from './dimensions';
import { dummy, instanced } from './shapes';
import type { Materials } from './materials';

export function createSummit(tower: THREE.Group, { rnd, range }: Random, mats: Materials, brick: THREE.Texture) {
	// ---------- the ragged brick ring and the loose bricks on the floor ----------
	const brickGeo = new THREE.BoxGeometry(0.88, 0.33, 0.56);
	const matrices: THREE.Matrix4[] = [], tints: THREE.Color[] = [];
	const tA = new THREE.Color(0xc98b4a), tB = new THREE.Color(0xa9713a), tL = new THREE.Color(0xe9e3d3);
	// how many courses high the wall has got at each angle
	const built = (a: number) => 1.1 + 3.7 * clamp(0.5 + 0.35 * Math.sin(a * 2 + 0.6) + 0.25 * Math.sin(a * 5 + 2.1), 0, 1);
	const n = 34, CH = 0.36;
	for (let c = 0; c < 14; c++) {
		for (let k = 0; k < n; k++) {
			const a = ((k + (c % 2) * 0.5) / n) * TAU;
			if (c * CH > built(a) + range(-0.3, 0.3)) continue;
			dummy.position.set(Math.cos(a) * R5, Y5 + c * CH + CH / 2, Math.sin(a) * R5);
			dummy.rotation.set(0, Math.PI / 2 - a + range(-0.03, 0.03), 0);
			dummy.scale.setScalar(1);
			dummy.updateMatrix();
			matrices.push(dummy.matrix.clone());
			const t = tA.clone().lerp(tB, rnd());
			tints.push(rnd() < 0.07 ? tL.clone() : t);
		}
	}
	for (let k = 0; k < 40; k++) {
		const a = rnd() * TAU, r = range(2.1, 4.2);
		dummy.position.set(Math.cos(a) * r, Y5 + 0.17 + (k % 3) * 0.33 * (rnd() < 0.4 ? 1 : 0), Math.sin(a) * r);
		dummy.rotation.set(0, rnd() * TAU, 0);
		dummy.updateMatrix();
		matrices.push(dummy.matrix.clone());
		tints.push(tA.clone().lerp(tB, rnd()));
	}
	const bricks = instanced(brickGeo, new THREE.MeshStandardMaterial({ map: brick, roughness: 0.95 }), matrices, { cast: true });
	tints.forEach((t, i) => bricks.setColorAt(i, t));
	tower.add(bricks);

	const floor = new THREE.Mesh(
		new THREE.CylinderGeometry(R5 + 0.1, R5 + 0.1, 0.12, 64),
		new THREE.MeshStandardMaterial({ color: 0xb08758, roughness: 1 }),
	);
	floor.position.y = Y5 + 0.06;
	floor.receiveShadow = true;
	const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.9, 2.0, 2.9), mats.limestone);
	plinth.position.y = Y5 + 1.0;
	plinth.castShadow = plinth.receiveShadow = true;
	tower.add(floor, plinth);

	// ---------- scaffolding: poles of uneven height, ledgers between them, a few braces ----------
	const segments: THREE.Matrix4[] = [];
	const beam = (p1: THREE.Vector3, p2: THREE.Vector3, thick: number) => {
		dummy.position.copy(p1).add(p2).multiplyScalar(0.5);
		dummy.scale.set(thick, thick, p1.distanceTo(p2));
		dummy.rotation.set(0, 0, 0);
		dummy.lookAt(p2);
		dummy.updateMatrix();
		segments.push(dummy.matrix.clone());
	};
	const NP = 18, rp = R5 + 0.85;
	const poleH: number[] = [];
	for (let k = 0; k < NP; k++) poleH.push(range(4.2, 6.8) * (Math.sin(k * 0.7) > -0.6 ? 1 : 0.55));
	const at = (k: number, h: number, r = rp) => {
		const a = (k / NP) * TAU;
		return new THREE.Vector3(Math.cos(a) * r, Y5 + h, Math.sin(a) * r);
	};
	for (let k = 0; k < NP; k++) {
		beam(at(k, -0.6), at(k, poleH[k]), 0.1);
		const k2 = (k + 1) % NP;
		for (const lv of [1.5, 3.0, 4.5]) {
			if (poleH[k] > lv + 0.2 && poleH[k2] > lv + 0.2) {
				beam(at(k, lv), at(k2, lv), 0.07);
				if (k % 2 === 0) beam(at(k, lv), at(k, lv, R5 - 0.75), 0.06);
			}
		}
		if (k % 3 === 0 && poleH[k2] > 3.2) beam(at(k, 0.2), at(k2, 3.0), 0.06);
	}
	tower.add(instanced(new THREE.BoxGeometry(1, 1, 1), mats.wood, segments, { cast: true, receive: false }));

	// ---------- treadwheel cranes: the jib swings, the rope pays out, the wheel turns ----------
	const loadMat = new THREE.MeshStandardMaterial({ color: 0xc98b4a, roughness: 0.9 });
	const cranes = [PARK[5].th + Math.PI / 2, PARK[5].th - Math.PI / 2 + 0.4].map((a, idx) => {
		const r = idx ? 3.4 : 3.3;
		const g = new THREE.Group();
		g.position.set(Math.cos(a) * r, Y5 + 0.1, Math.sin(a) * r);
		const mast = new THREE.Mesh(new THREE.BoxGeometry(0.22, 7.4, 0.22), mats.wood);
		mast.position.y = 3.7;
		mast.castShadow = true;
		const arm = new THREE.Group();
		arm.position.y = 7.2;
		const jib = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 5.4), mats.wood);
		jib.position.set(0, 0.9, 2.2);
		jib.rotation.x = -0.34;
		jib.castShadow = true;
		const rope = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1, 0.03), mats.ink);
		const load = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.3, 0.45), loadMat);
		load.castShadow = true;
		arm.add(jib, rope, load);
		const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.08, 6, 28), mats.wood);
		wheel.position.set(0, 0.95, -0.5);
		g.add(mast, arm, wheel);
		for (let s = 0; s < 4; s++) {
			const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.7, 0.05), mats.wood);
			spoke.position.copy(wheel.position);
			spoke.rotation.z = (s * Math.PI) / 4;
			g.add(spoke);
		}
		tower.add(g);
		return { arm, rope, load, wheel, phase: rnd() * 10, base: rnd() * TAU };
	});
	const tipZ = 2.2 + Math.cos(0.34) * 2.6, tipY = 0.9 + Math.sin(0.34) * 2.6;

	// ---------- the top as a way into the game: what a pointer hits, and how it answers ----------
	// an invisible drum round the whole unfinished top (floor, ring, scaffolding, cranes), so it is
	// an easy target, and a warm lamp over it plus a faint glow on its own materials when hovered
	const hitArea = new THREE.Mesh(new THREE.CylinderGeometry(rp + 0.4, rp + 0.4, 8.6, 24), new THREE.MeshBasicMaterial({ visible: false }));
	hitArea.position.y = Y5 + 4.1;
	tower.add(hitArea);
	const ray = new THREE.Raycaster();
	const lamp = new THREE.PointLight(0xffb066, 0, 22, 1.6);
	lamp.position.y = Y5 + 5;
	tower.add(lamp);
	const glowing = [bricks.material as THREE.MeshStandardMaterial, floor.material as THREE.MeshStandardMaterial, loadMat];
	glowing.forEach((m) => m.emissive.setRGB(1, 0.62, 0.3));
	let hot = 0;
	let glow = 0;

	function update(time: number, dt = 0) {
		glow += (hot - glow) * Math.min(1, dt * 7);
		lamp.intensity = glow * 16;
		for (const m of glowing) m.emissiveIntensity = glow * 0.09;
		for (const c of cranes) {
			c.arm.rotation.y = c.base + Math.sin(time * 0.18 + c.phase) * 1.1;
			const len = 2.3 + Math.sin(time * 0.5 + c.phase) * 1.1;
			c.rope.scale.y = len;
			c.rope.position.set(0, tipY - len / 2, tipZ);
			c.load.position.set(0, tipY - len - 0.15, tipZ);
			c.load.rotation.y = time * 0.3;
			c.wheel.rotation.z = time * 0.6 + c.phase;
		}
	}

	update(0);
	return {
		update,
		/** Whether a pointer at normalised device coordinates is over the top. */
		pick(ndc: THREE.Vector2, camera: THREE.Camera) {
			ray.setFromCamera(ndc, camera);
			return ray.intersectObject(hitArea, false).length > 0;
		},
		/** Lights the top while it is pointed at (a soft lamp and glow, eased in `update`). */
		setHot(on: boolean) {
			hot = on ? 1 : 0;
		},
	};
}

