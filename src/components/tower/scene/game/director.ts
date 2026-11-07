/**
 * Game mode's camera shot and work-light, plugged into the scene through its Director seam.
 * Entering flies the camera from the climb to a close shot over the summit plinth (blended in
 * over 1.5 s while the panel framing eases out), the sky settles at golden dusk, and a warm
 * work-light comes on over the stack; leaving blends everything back to the climb.
 *
 * It also runs the stack's simulation, so the game advances in the scene's one render loop.
 * Once it has blended out and nothing is left falling, it calls `onRest` so the scene can drop it.
 */
import * as THREE from 'three';
import { clamp, easeInOut, isNarrow } from '../util';
import { LAST_TIER, PARK } from '../dimensions';
import type { Director } from '../index';
import type { Stack } from './stack';

/** Seconds to blend between the climb and the game shot. */
const BLEND_TIME = 1.5;
/** Sky altitude (0 dawn .. 1 night) while playing: golden dusk, warm enough to see the bricks. */
const GAME_ALTITUDE = 0.8;

export function createGameDirector(scene: THREE.Scene, stack: Stack, onRest: () => void) {
	// added once and left in place (dark when idle), so the scene's light count never changes
	const light = new THREE.PointLight(0xffd6a8, 0, 40, 1.4);
	scene.add(light);

	const pos = new THREE.Vector3();
	const look = new THREE.Vector3();
	const shot = { pos, look, blend: 0, altitude: GAME_ALTITUDE };
	let active = false;
	let blend = 0;

	const director: Director & { active: boolean; dispose(): void } = {
		get active() {
			return active;
		},
		set active(v: boolean) {
			active = v;
		},
		update(dt, time) {
			blend = clamp(blend + (active ? dt : -dt) / BLEND_TIME, 0, 1);
			const b = easeInOut(blend);
			stack.update(dt);

			const narrow = isNarrow();
			const th = PARK[LAST_TIER].th + Math.sin(time * 0.12) * 0.12;
			const dist = narrow ? 19 : 15;
			const top = stack.camTop;
			pos.set(Math.cos(th) * dist, top + (narrow ? 14 : 10.5), Math.sin(th) * dist);
			look.set(0, top + 0.4, 0);
			light.position.set(Math.cos(th + 0.5) * 6, top + 7, Math.sin(th + 0.5) * 6);
			light.intensity = b * 90;

			shot.blend = b;
			if (!active && blend === 0 && stack.idle) {
				stack.settle();
				onRest();
			}
			return shot;
		},
		dispose() {
			scene.remove(light);
			light.dispose();
		},
	};
	return director;
}

export type GameDirector = ReturnType<typeof createGameDirector>;

