/**
 * Code tier: each project is a doorway in the wall, in the same order as the cards. An open one
 * looks into a lamplit hall inside the tier, shared by every open doorway (./door-interior.ts); its
 * lamp burns brighter, and its own warm light outside rises, while its card or the door itself is
 * hovered or in focus. A project with no public URL gets a bricked-up doorway that never lights.
 */
import * as THREE from 'three';
import { damp } from '../util';
import { rAt, yb } from '../dimensions';
import { archPath, archShape, extrude, placeWall } from '../shapes';
import { LAMP_LIT, LAMP_REST, MAX_LAMPS, createInteriorMaterial, type Hall } from './door-interior';
import type { Materials } from '../materials';

export interface DoorSpec {
	id: string;
	href?: string;
}

interface Door extends DoorSpec {
	/** Its lamp in the hall (-1 for a bricked door, which never lights). */
	lamp: number;
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
	const archGeo = new THREE.ShapeGeometry(archShape(W, H), 12);
	const frameShape = archShape(2.05, 3.05, -0.12);
	frameShape.holes.push(archPath(W, H, 0.02));
	const frameGeo = extrude(frameShape, 0.32);

	const y = yb(1) + 0.42;
	// the wall leans in as it rises (its batter), so it stands furthest out at the door's foot: the
	// flat opening goes in front of it there, or the wall's bricks show through its lower middle
	const rWall = rAt(1, y) + 0.03;
	// the hall behind the open doorways, a lamp hung just inside each (./door-interior.ts)
	const hall: Hall = {
		rOut: rWall - 0.4,
		rIn: rWall - 4.9,
		floor: y,
		ceiling: y + 4,
		lamps: specs.flatMap((s, i) =>
			s.href ? [new THREE.Vector3(Math.cos(angles[i]) * (rWall - 1.1), y + 2.3, Math.sin(angles[i]) * (rWall - 1.1))] : [],
		),
		power: new Array(MAX_LAMPS).fill(LAMP_REST),
	};
	// each open door's lamp, in the same order as the lamps
	const lampOf = specs.map((_, i) => specs.slice(0, i).filter((s) => s.href).length);
	const hits: THREE.Object3D[] = [];
	const doors: Door[] = specs.map((spec, idx) => {
		const a = angles[idx];
		const r = rAt(1, y + 1.3);
		const open = !!spec.href;
		const inside = createInteriorMaterial({ w: W, h: H, kind: open ? 'hall' : 'bricked', depth: 0.32, brick, hall });
		const opening = new THREE.Mesh(archGeo, inside.material);
		opening.applyMatrix4(placeWall(a, rWall, y));
		opening.onBeforeRender = (_r, _s, camera) => inside.look(opening, camera);
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
		return { ...spec, lamp: open && lampOf[idx] < MAX_LAMPS ? lampOf[idx] : -1, light, lit: 0 };
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
				if (d.lamp < 0 || !d.light) return;
				d.lit += ((hot === i ? 1 : 0) - d.lit) * damp(8, dt);
				const pulse = Math.sin(time * 2 + i) * 0.08;
				d.light.intensity = 3 + d.lit * 14;
				// lit, the door's lamp in the hall burns brighter, and lights the hall around it
				hall.power[d.lamp] = LAMP_REST + d.lit * (LAMP_LIT - LAMP_REST) + pulse * 2 * (0.4 + d.lit);
			});
		},
	};
}

