/**
 * Making tier: six glowing guitar strings stretched between two limestone bars beside the tower.
 * The pointer crossing a string on screen plucks that string: it rings out and settles back to a
 * hum, and guitar-sound.ts plays its note. Index 0 is the thinnest (high E), 5 the thickest (low E).
 * Seen from the making tier the low string is on the left and the high one on the right, like a
 * guitar held head-up.
 */
import * as THREE from 'three';
import { damp, lerp, sstep } from '../util';
import { PARK, R, yb, tierPos } from '../dimensions';
import type { Materials } from '../materials';

const vertexShader = /* glsl */ `
	uniform float uTime, uAmp, uIdx;
	varying float vY;
	void main() {
		vec3 p = position;
		float y01 = uv.y;
		// a standing wave: fixed at both ends, each string at its own pitch
		p.x += sin(y01 * 3.14159) * sin(uTime * (19.0 + uIdx * 4.3)) * uAmp * (0.7 + 0.12 * uIdx);
		vY = y01;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
	}`;

const fragmentShader = /* glsl */ `
	uniform vec3 uCol;
	varying float vY;
	void main() {
		float e = smoothstep(0.0, 0.05, vY) * smoothstep(1.0, 0.95, vY);
		gl_FragColor = vec4(uCol * e, e);
	}`;

const HUM = 0.03;
const MAX = 0.55;

/**
 * The making tier's frame beside the tower, facing the parked camera: the strings stand at its
 * origin, and the self-portrait (portrait.ts) hangs beside them in the same frame.
 */
export function placeAtMakingTier(obj: THREE.Object3D) {
	obj.position.copy(tierPos(4, R[4] + 3.0, yb(4) + 3.2));
	obj.rotation.y = Math.PI / 2 - PARK[4].th;
}

export const STRING_COUNT = 6;

/** Across the frame, from the thinnest string (high E, right) to the thickest (low E, left). */
const stringX = (k: number) => ((STRING_COUNT - 1) / 2 - k) * 0.36;

export function createStrings(scene: THREE.Scene, mats: Materials) {
	const shared = { uTime: { value: 0 }, uCol: { value: new THREE.Color(2.4, 1.6, 0.75) } };
	/** Each string rings on its own. */
	const amps = Array.from({ length: STRING_COUNT }, () => ({ value: HUM }));
	/** Each string's ends in world space, for telling which one the pointer crossed. */
	const ends: { top: THREE.Vector3; bottom: THREE.Vector3 }[] = [];
	const group = new THREE.Group();
	placeAtMakingTier(group);
	for (let k = 0; k < STRING_COUNT; k++) {
		const mat = new THREE.ShaderMaterial({
			uniforms: { ...shared, uAmp: amps[k], uIdx: { value: k } },
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			// a string is a flat strip of light: draw both faces, so it still glows seen from behind
			side: THREE.DoubleSide,
			vertexShader,
			fragmentShader,
		});
		const m = new THREE.Mesh(new THREE.PlaneGeometry(0.04 + k * 0.008, 5.6, 1, 48), mat);
		m.position.x = stringX(k);
		group.add(m);
	}
	for (const yy of [-2.9, 2.9]) {
		const bar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.16, 0.16), mats.limestone);
		bar.position.y = yy;
		bar.castShadow = true;
		group.add(bar);
	}
	scene.add(group);
	group.updateMatrixWorld(true);
	for (let k = 0; k < STRING_COUNT; k++) {
		const x = stringX(k);
		ends.push({ top: group.localToWorld(new THREE.Vector3(x, 2.8, 0)), bottom: group.localToWorld(new THREE.Vector3(x, -2.8, 0)) });
	}
	const top = new THREE.Vector3(), bottom = new THREE.Vector3();
	/**
	 * Which side of each string the pointer was on at its last move (−1 or +1), or 0 when it wasn't
	 * level with that string. Each side is measured against the string where it is on screen at that
	 * moment, so the camera drifting with the pointer (the climb's parallax) can't skip a string.
	 */
	const sides = new Array<number>(STRING_COUNT).fill(0);
	let lastX = 0;

	return {
		/**
		 * Follows the pointer (in NDC) and returns the strings it crossed since its last move, in the
		 * order it met them, so a fast sweep across all six plays them as a strum.
		 */
		track(at: THREE.Vector2, camera: THREE.Camera): number[] {
			const hits: { k: number; d: number }[] = [];
			for (let k = 0; k < STRING_COUNT; k++) {
				top.copy(ends[k].top).project(camera);
				bottom.copy(ends[k].bottom).project(camera);
				// behind the camera, or the pointer above or below the string: not beside it
				if (top.z > 1 || bottom.z > 1 || at.y > Math.max(top.y, bottom.y) || at.y < Math.min(top.y, bottom.y)) {
					sides[k] = 0;
					continue;
				}
				// where the string is at the pointer's height
				const x = bottom.x + ((top.x - bottom.x) * (at.y - bottom.y)) / (top.y - bottom.y);
				// exactly on the string: still on the side it came from
				const side = Math.sign(at.x - x) || sides[k];
				if (sides[k] !== 0 && side !== sides[k]) hits.push({ k, d: Math.abs(x - lastX) });
				sides[k] = side;
			}
			lastX = at.x;
			return hits.sort((p, q) => p.d - q.d).map((h) => h.k);
		},
		/** Forgets where the pointer was (a new touch, or the pointer leaving the tier), so nothing is struck on return. */
		resetTracking() {
			sides.fill(0);
		},
		/** Sets string `k` ringing; `strength` 0–1. */
		pluck(k: number, strength: number) {
			const amp = amps[k];
			if (amp) amp.value = Math.min(MAX, Math.max(amp.value, HUM + (MAX - HUM) * strength));
		},
		update(dt: number, time: number, progress: number) {
			shared.uTime.value = time;
			// always on the tower, like the languages tier's glyphs: a faint glow from afar that
			// brightens to full as the climb reaches the making tier
			const near = 1 - sstep(0.4, 1.6, Math.abs(progress - 4));
			shared.uCol.value.setRGB(2.4, 1.6, 0.75).multiplyScalar(0.12 + 0.88 * near);
			for (const amp of amps) amp.value = lerp(amp.value, HUM, damp(1.4, dt));
		},
	};
}

