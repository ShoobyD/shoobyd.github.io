/**
 * The Flemish plain around the tower: patchwork fields rolling into hills, a sea to one side,
 * a limestone plaza at the foot, and a scatter of houses and trees (all instanced).
 */
import * as THREE from 'three';
import { TAU, hash2, sstep, type Random } from './util';
import { dummy, instanced } from './shapes';
import type { Atmosphere } from './sky';

/** 0 on land, 1 out at sea; the coast runs diagonally across one quadrant. */
export const seaMask = (x: number, z: number) => sstep(150, 270, x * 0.74 + z * 0.67 + Math.sin(z * 0.012) * 30);

/** Ground height: flat around the plaza, hills further out, sinking under the sea. */
export function groundHeight(x: number, z: number) {
	const d = Math.hypot(x, z);
	const n =
		Math.sin(x * 0.013) * Math.cos(z * 0.011) * 0.6 +
		Math.sin(x * 0.031 + z * 0.02) * 0.3 +
		Math.sin(z * 0.05 - x * 0.04) * 0.12;
	const hills = (n + 0.35) * 15 * sstep(55, 230, d);
	const m = seaMask(x, z);
	return hills * (1 - m) - m * 9;
}

export function createLandscape(scene: THREE.Scene, { rnd, range }: Random) {
	// ground: one vertex-coloured plane, each field a hashed cell, dust near the tower, sand at the coast
	const geo = new THREE.PlaneGeometry(2400, 2400, 220, 220);
	geo.rotateX(-Math.PI / 2);
	const pos = geo.attributes.position;
	const cols = new Float32Array(pos.count * 3);
	const fields = ['#8f8a4c', '#a89a58', '#76804a', '#b59c5f', '#839052', '#9c8450', '#6e7a44'].map((h) => new THREE.Color(h));
	const dust = new THREE.Color('#b98e5c'), sand = new THREE.Color('#cdb48a'), c = new THREE.Color();
	for (let i = 0; i < pos.count; i++) {
		const x = pos.getX(i), z = pos.getZ(i);
		pos.setY(i, groundHeight(x, z));
		const fx = Math.floor((x + Math.sin(z * 0.02) * 8) / 26);
		const fz = Math.floor((z + Math.sin(x * 0.017) * 8) / 18);
		c.copy(fields[Math.floor(hash2(fx, fz) * fields.length)]);
		c.lerp(dust, 1 - sstep(26, 52, Math.hypot(x, z)));
		const m = seaMask(x, z);
		if (m > 0.15) c.lerp(sand, sstep(0.15, 0.45, m));
		cols.set([c.r, c.g, c.b], i * 3);
	}
	geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
	geo.computeVertexNormals();
	const ground = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
	ground.receiveShadow = true;
	scene.add(ground);

	const waterMat = new THREE.MeshStandardMaterial({ color: 0x6f8fb3, roughness: 0.28, metalness: 0.15 });
	const water = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), waterMat);
	water.rotation.x = -Math.PI / 2;
	water.position.y = -1.4;
	scene.add(water);

	const plaza = new THREE.Mesh(
		new THREE.CylinderGeometry(19.5, 21, 0.8, 120),
		new THREE.MeshStandardMaterial({ color: 0xcdbf9f, roughness: 0.95 }),
	);
	plaza.receiveShadow = true;
	scene.add(plaza);

	// houses with hipped roofs, then trees, kept off the shore
	const houses: THREE.Matrix4[] = [], roofs: THREE.Matrix4[] = [], trees: THREE.Matrix4[] = [];
	for (let k = 0; k < 170; k++) {
		const a = rnd() * TAU, r = range(25, 95), x = Math.cos(a) * r, z = Math.sin(a) * r;
		if (seaMask(x, z) > 0.05) continue;
		const w = range(1.2, 2.2), h = range(1, 1.8), d = range(1.2, 2), y = groundHeight(x, z), rot = rnd() * TAU;
		dummy.position.set(x, y + h / 2, z);
		dummy.rotation.set(0, rot, 0);
		dummy.scale.set(w, h, d);
		dummy.updateMatrix();
		houses.push(dummy.matrix.clone());
		const roof = Math.max(w, d) * 0.78;
		dummy.position.set(x, y + h + 0.5, z);
		dummy.rotation.set(0, rot + Math.PI / 4, 0);
		dummy.scale.set(roof, 1, roof);
		dummy.updateMatrix();
		roofs.push(dummy.matrix.clone());
	}
	for (let k = 0; k < 340; k++) {
		const a = rnd() * TAU, r = range(32, 260), x = Math.cos(a) * r, z = Math.sin(a) * r;
		if (seaMask(x, z) > 0.05) continue;
		const s = range(0.8, 1.8);
		dummy.position.set(x, groundHeight(x, z) + 1.3 * s, z);
		dummy.rotation.set(0, 0, 0);
		dummy.scale.set(s, s, s);
		dummy.updateMatrix();
		trees.push(dummy.matrix.clone());
	}
	const houseMesh = instanced(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 }), houses);
	const tint = new THREE.Color();
	houses.forEach((_, i) => houseMesh.setColorAt(i, tint.set([0xe9e3d3, 0xd8c4a0, 0xc98b4a, 0xe2d6bd][i % 4])));
	scene.add(
		houseMesh,
		instanced(new THREE.ConeGeometry(0.75, 1, 4), new THREE.MeshStandardMaterial({ color: 0x8a4b2e, roughness: 1 }), roofs),
		instanced(new THREE.ConeGeometry(0.7, 2.6, 7), new THREE.MeshStandardMaterial({ color: 0x4f5c34, roughness: 1 }), trees),
	);

	return {
		/** The sea mirrors the sky, a little darker. */
		update(atmo: Atmosphere) {
			waterMat.color.copy(atmo.horizon).lerp(atmo.top, 0.55).multiplyScalar(0.85);
		},
	};
}

