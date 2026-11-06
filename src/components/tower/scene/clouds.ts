/**
 * Drifting clouds in three bands: a wide far ring, puffs hugging the tower's middle, and high
 * thin cirrus. Each is a fogged sprite that thins out as the camera flies through it.
 */
import * as THREE from 'three';
import { TAU, lerp, sstep, type Random } from './util';
import { cloudTexture } from './textures';
import type { Atmosphere } from './sky';

export function createClouds(scene: THREE.Scene, { rnd, range }: Random) {
	const textures = [cloudTexture(3), cloudTexture(11), cloudTexture(27)];
	const clouds: { sprite: THREE.Sprite; mat: THREE.SpriteMaterial; a: number; r: number; y: number; speed: number; opacity: number }[] = [];

	function add(r: number, y: number, scale: number, opacity: number) {
		const mat = new THREE.SpriteMaterial({ map: textures[(rnd() * 3) | 0], transparent: true, depthWrite: false, opacity, fog: true });
		const sprite = new THREE.Sprite(mat);
		sprite.scale.set(scale, scale * 0.55, 1);
		clouds.push({ sprite, mat, a: rnd() * TAU, r, y, speed: range(0.004, 0.012) * (rnd() < 0.5 ? 1 : -1), opacity });
		scene.add(sprite);
	}
	for (let k = 0; k < 26; k++) add(range(60, 230), range(8, 46), range(40, 95), range(0.6, 0.9));
	for (let k = 0; k < 16; k++) add(range(19, 42), range(16, 27), range(12, 24), range(0.45, 0.7));
	for (let k = 0; k < 10; k++) add(range(80, 260), range(55, 85), range(60, 120), range(0.3, 0.55));

	function update(dt: number, time: number, camera: THREE.Camera, atmo: Atmosphere) {
		// the near band fades as the camera pulls out wide, so it never smears across the base view
		const camAxis = Math.hypot(camera.position.x, camera.position.z);
		const nearFade = lerp(1, 0.25, sstep(45, 70, camAxis));
		for (const c of clouds) {
			c.a += c.speed * dt;
			c.sprite.position.set(Math.cos(c.a) * c.r, c.y + Math.sin(time * 0.1 + c.a * 3) * 0.6, Math.sin(c.a) * c.r);
			const dCam = c.sprite.position.distanceTo(camera.position);
			c.mat.opacity = c.opacity * sstep(4, 16, dCam) * (c.r < 50 ? nearFade : 1);
			c.mat.color.copy(atmo.cloud);
		}
	}

	return { update };
}

