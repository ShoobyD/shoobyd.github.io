/**
 * Code tier: each project is a lamplit doorway in the wall, in the same order as the cards.
 * A door brightens (with its own warm light) while its card or the door itself is hovered.
 * A project with no public URL gets a bricked-up doorway that never lights.
 */
import * as THREE from 'three';
import { damp } from '../util';
import { rAt, yb } from '../dimensions';
import { archPath, archShape, extrude, placeWall } from '../shapes';
import { doorGlowTexture } from '../textures';
import type { Materials } from '../materials';

export interface DoorSpec {
	id: string;
	href?: string;
}

interface Door extends DoorSpec {
	mat: THREE.MeshBasicMaterial | null;
	light: THREE.PointLight | null;
	lit: number;
}

export function createDoors(
	tower: THREE.Group,
	mats: Materials,
	brick: THREE.Texture,
	specs: DoorSpec[],
	angles: number[],
) {
	const W = 1.5, H = 2.7;
	const glowGeo = new THREE.ShapeGeometry(archShape(W, H), 12);
	// map the arch's UVs to its own bounds, so the lamplight gradient fills the opening
	const uv = glowGeo.attributes.uv, gp = glowGeo.attributes.position;
	for (let i = 0; i < uv.count; i++) uv.setXY(i, (gp.getX(i) + W / 2) / W, gp.getY(i) / H);
	const glowTex = doorGlowTexture();
	const frameShape = archShape(2.05, 3.05, -0.12);
	frameShape.holes.push(archPath(W, H, 0.02));
	const frameGeo = extrude(frameShape, 0.32);
	const bricked = brick.clone();
	bricked.repeat.set(0.9, 1.4);
	bricked.needsUpdate = true;
	const brickedMat = new THREE.MeshStandardMaterial({ map: bricked, color: 0xd8b48a, roughness: 1 });

	const y = yb(1) + 0.42;
	const hits: THREE.Object3D[] = [];
	const doors: Door[] = specs.map((spec, idx) => {
		const a = angles[idx];
		const r = rAt(1, y + 1.3);
		const open = !!spec.href;
		const mat = open ? new THREE.MeshBasicMaterial({ map: glowTex, color: new THREE.Color(1, 1, 1) }) : null;
		const opening = new THREE.Mesh(glowGeo, mat ?? brickedMat);
		opening.applyMatrix4(placeWall(a, r + 0.03, y));
		const frame = new THREE.Mesh(frameGeo, mats.limestone);
		frame.applyMatrix4(placeWall(a, r - 0.1, y));
		frame.castShadow = true;
		tower.add(opening, frame);
		let light: THREE.PointLight | null = null;
		if (open) {
			light = new THREE.PointLight(0xffb066, 3, 11, 2);
			light.position.set(Math.cos(a) * (r + 1.6), y + 1.3, Math.sin(a) * (r + 1.6));
			tower.add(light);
			opening.userData.door = frame.userData.door = idx;
			hits.push(opening, frame);
		}
		return { ...spec, mat, light, lit: 0 };
	});

	let hot = -1;
	const ray = new THREE.Raycaster();

	return {
		doors,
		/** The door under a pointer at normalised device coordinates, or -1. */
		pick(ndc: THREE.Vector2, camera: THREE.Camera) {
			ray.setFromCamera(ndc, camera);
			const hit = ray.intersectObjects(hits, false)[0];
			return hit ? (hit.object.userData.door as number) : -1;
		},
		setHot(i: number) {
			hot = i;
		},
		update(dt: number, time: number) {
			doors.forEach((d, i) => {
				if (!d.mat || !d.light) return;
				d.lit += ((hot === i ? 1 : 0) - d.lit) * damp(8, dt);
				const pulse = Math.sin(time * 2 + i) * 0.08;
				d.mat.color.setScalar(0.85 + d.lit * 2.6 + pulse);
				d.light.intensity = 3 + d.lit * 26;
			});
		},
	};
}

