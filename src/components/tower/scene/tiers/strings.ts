/**
 * Making tier: six glowing guitar strings stretched between two limestone bars beside the tower.
 * Sweeping the pointer across the screen strums them; they ring out and settle back to a hum.
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

export function createStrings(scene: THREE.Scene, mats: Materials) {
	const shared = { uTime: { value: 0 }, uAmp: { value: HUM }, uCol: { value: new THREE.Color(2.4, 1.6, 0.75) } };
	const group = new THREE.Group();
	placeAtMakingTier(group);
	for (let k = 0; k < 6; k++) {
		const mat = new THREE.ShaderMaterial({
			uniforms: { ...shared, uIdx: { value: k } },
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			vertexShader,
			fragmentShader,
		});
		const m = new THREE.Mesh(new THREE.PlaneGeometry(0.04 + k * 0.008, 5.6, 1, 48), mat);
		m.position.x = (k - 2.5) * 0.36;
		group.add(m);
	}
	for (const yy of [-2.9, 2.9]) {
		const bar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.16, 0.16), mats.limestone);
		bar.position.y = yy;
		bar.castShadow = true;
		group.add(bar);
	}
	scene.add(group);

	return {
		/** A horizontal pointer sweep of `dx` pixels plucks the strings. */
		strum(dx: number) {
			shared.uAmp.value = Math.min(MAX, shared.uAmp.value + Math.abs(dx) * 0.0016);
		},
		update(dt: number, time: number, progress: number) {
			shared.uTime.value = time;
			shared.uCol.value.setRGB(2.4, 1.6, 0.75).multiplyScalar(1 - sstep(0.5, 1.4, Math.abs(progress - 4)));
			shared.uAmp.value = lerp(shared.uAmp.value, HUM, damp(1.4, dt));
		},
	};
}

