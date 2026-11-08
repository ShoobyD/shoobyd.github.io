/**
 * Drifting clouds in three bands: a wide far ring, puffs hugging the tower's middle, and high
 * thin cirrus. Each is a fogged sprite that thins out as the camera flies through it.
 *
 * Clouds may veil the tower anywhere but at the heart of a stop: each tier's park has a focus
 * corridor (the cone from the parked camera to the middle of its tier, for the wide and the
 * narrow-screen distance alike, and on the code tier all along the camera's walk past its doors),
 * and no cloud is placed in one. So that none drifts into one
 * either, a cloud doesn't circle the tower: it sways back and forth along a short arc of its
 * ring, and the whole arc is checked when it is placed.
 */
import * as THREE from 'three';
import { TAU, lerp, sstep, type Random } from './util';
import { cloudTexture } from './textures';
import { PARK, type Park } from './dimensions';
import type { Atmosphere } from './sky';

/** Half the width and height (world units, at the tower's axis) of a stop's focus that stays clear. */
const FOCUS_W = 13;
const FOCUS_H = 7.5;
/** The parked camera's distance: as set for wide screens, and pulled back for narrow ones (camera-path.ts). */
const DIST_SCALES = [1, 1.38];
/** How finely a cloud's arc is checked, in radians. */
const ARC_STEP = 0.04;

/** Wraps an angle to -π..π. */
const wrap = (a: number) => a - TAU * Math.round(a / TAU);

/**
 * Every camera view a stop holds: each park as it is, and the code tier's park turned through
 * its walk along the doors (±`codePan` radians, in small steps).
 */
function stopViews(codePan: number): Park[] {
	const views: Park[] = [];
	PARK.forEach((park, i) => {
		if (i !== 1 || codePan <= 0) return views.push(park);
		const steps = Math.ceil(codePan / 0.08);
		for (let k = -steps; k <= steps; k++) views.push({ ...park, th: park.th + (codePan * k) / steps });
	});
	return views;
}

/**
 * Whether a cloud at angle `th`, ring radius `r` and height `y` (half-size `hw` × `hh`) would sit
 * in front of the focus of any of the stops' `views`.
 */
function blocksFocus(views: Park[], th: number, r: number, y: number, hw: number, hh: number) {
	for (const park of views) {
		const d = wrap(th - park.th);
		const depth = r * Math.cos(d); // along the camera's line, from the axis toward the camera
		if (depth <= 0) continue; // behind the axis: the tower itself hides it
		const across = Math.abs(r * Math.sin(d));
		for (const k of DIST_SCALES) {
			const dist = park.dist * k;
			if (depth >= dist - 1) continue; // level with or behind the camera
			// the focus cone narrows from the axis toward the camera
			const s = depth / dist;
			const shrink = 1 - s;
			const sightY = park.look + (park.y - park.look) * s;
			if (across < FOCUS_W * shrink + hw && Math.abs(y - sightY) < FOCUS_H * shrink + hh) return true;
		}
	}
	return false;
}

/** `codePan`: how far the camera turns either way on its walk along the code tier's doors (radians). */
export function createClouds(scene: THREE.Scene, { rnd, range }: Random, codePan = 0) {
	const views = stopViews(codePan);
	const textures = [cloudTexture(3), cloudTexture(11), cloudTexture(27)];
	const clouds: {
		sprite: THREE.Sprite;
		mat: THREE.SpriteMaterial;
		/** the middle of its arc, the arc's half-width, and the sway's rate and phase */
		a0: number;
		amp: number;
		w: number;
		phase: number;
		r: number;
		y: number;
		opacity: number;
	}[] = [];

	/** Places a cloud of the band clear of every stop's focus (or skips it when no place is found). */
	function add(rr: [number, number], yy: [number, number], ss: [number, number], oo: [number, number]) {
		const scale = range(...ss);
		const hw = scale * 0.4;
		const hh = scale * 0.55 * 0.4 + 0.6; // + the vertical bob
		for (let tries = 0; tries < 60; tries++) {
			const r = range(...rr);
			const y = range(...yy);
			const a0 = rnd() * TAU;
			const amp = range(0.12, 0.3);
			let clear = true;
			for (let a = a0 - amp; a <= a0 + amp + 1e-6 && clear; a += ARC_STEP) clear = !blocksFocus(views, a, r, y, hw, hh);
			if (!clear) continue;
			const opacity = range(...oo);
			const mat = new THREE.SpriteMaterial({ map: textures[(rnd() * 3) | 0], transparent: true, depthWrite: false, opacity, fog: true });
			const sprite = new THREE.Sprite(mat);
			sprite.scale.set(scale, scale * 0.55, 1);
			// about as slow as the old orbits at the middle of the sway
			const speed = range(0.004, 0.012);
			clouds.push({ sprite, mat, a0, amp, w: speed / amp, phase: rnd() * TAU, r, y, opacity });
			scene.add(sprite);
			return;
		}
	}
	for (let k = 0; k < 26; k++) add([60, 230], [8, 46], [40, 95], [0.6, 0.9]);
	for (let k = 0; k < 16; k++) add([19, 42], [16, 27], [12, 24], [0.45, 0.7]);
	for (let k = 0; k < 10; k++) add([80, 260], [55, 85], [60, 120], [0.3, 0.55]);

	function update(_dt: number, time: number, camera: THREE.Camera, atmo: Atmosphere) {
		// the near band fades as the camera pulls out wide, so it never smears across the base view
		const camAxis = Math.hypot(camera.position.x, camera.position.z);
		const nearFade = lerp(1, 0.25, sstep(45, 70, camAxis));
		for (const c of clouds) {
			const a = c.a0 + c.amp * Math.sin(time * c.w + c.phase);
			c.sprite.position.set(Math.cos(a) * c.r, c.y + Math.sin(time * 0.1 + a * 3) * 0.6, Math.sin(a) * c.r);
			const dCam = c.sprite.position.distanceTo(camera.position);
			c.mat.opacity = c.opacity * sstep(4, 16, dCam) * (c.r < 50 ? nearFade : 1);
			c.mat.color.copy(atmo.cloud);
		}
	}

	return { update };
}

