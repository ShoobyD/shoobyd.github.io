/**
 * About a hundred tiny builders walking the ramp, up and down, bobbing as they go
 * (one instanced capsule mesh, updated each frame).
 */
import * as THREE from 'three';
import { TAU, type Random } from './util';
import { RAMP_A0, TIERS } from './dimensions';
import { dummy } from './shapes';
import { rampIn, rampY } from './tower';

const COUNT = 120;

export function createFigures(tower: THREE.Group, { rnd, range }: Random) {
	const mesh = new THREE.InstancedMesh(
		new THREE.CapsuleGeometry(0.1, 0.24, 2, 6),
		new THREE.MeshStandardMaterial({ color: 0x2d2a26, roughness: 1 }),
		COUNT,
	);
	mesh.castShadow = true;
	tower.add(mesh);

	const walkers = Array.from({ length: COUNT }, () => ({
		tier: (rnd() * TIERS) | 0,
		t: rnd(),
		speed: (rnd() < 0.6 ? 1 : -1) * range(0.006, 0.016),
		lane: range(0.25, 0.95),
		phase: rnd() * 10,
	}));
	// mostly shadow ink, with madder-red and indigo robes among them
	const tint = new THREE.Color();
	walkers.forEach((_, k) => mesh.setColorAt(k, tint.set(rnd() < 0.25 ? 0x8a3b2a : rnd() < 0.5 ? 0x3c4a66 : 0x2d2a26)));

	function update(dt: number, time: number) {
		for (let k = 0; k < COUNT; k++) {
			const f = walkers[k];
			f.t += f.speed * dt;
			// walking off the end of a turn carries on to the next tier
			if (f.t > 1) {
				f.t -= 1;
				f.tier = (f.tier + 1) % TIERS;
			} else if (f.t < 0) {
				f.t += 1;
				f.tier = (f.tier + TIERS - 1) % TIERS;
			}
			const a = RAMP_A0 + f.t * TAU, r = rampIn(f.tier, f.t) + f.lane;
			const bob = Math.abs(Math.sin(time * 7 + f.phase)) * 0.04;
			dummy.position.set(Math.cos(a) * r, rampY(f.tier, f.t) + 0.22 + bob, Math.sin(a) * r);
			dummy.rotation.set(0, 0, 0);
			dummy.scale.setScalar(1);
			dummy.updateMatrix();
			mesh.setMatrixAt(k, dummy.matrix);
		}
		mesh.instanceMatrix.needsUpdate = true;
	}

	update(0, 0);
	return { update };
}

