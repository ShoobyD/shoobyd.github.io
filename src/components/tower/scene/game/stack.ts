/**
 * Game mode's brick stacking: a brick slides over the top of the stack, on alternating axes;
 * dropping it slices off whatever overhangs the brick below, and the slice falls away under a
 * simple gravity. A drop within a hair of the brick below snaps into place (a "perfect"), with a
 * warm flash under it. Missing the stack entirely ends the run.
 *
 * Every mesh lives in one group under the tower, so laid bricks stay on the tower after the
 * game ends. Only geometries are per brick; materials come from a small shared palette.
 */
import * as THREE from 'three';
import { damp } from '../util';

/** Brick height, the footprint of the first brick (just inside the plinth), and the slide reach. */
const BH = 0.5;
const BS = 2.8;
const AMP = 3.6;
/** How close (in world units) a drop must land to count as perfect and snap. */
const PERFECT = 0.13;
const SPEED0 = 2.4;
const SPEED_MAX = 6.5;
const GRAVITY = 22;
/** Shades of mudbrick the courses cycle through; every fifth course is a limestone band. */
const TONES = 8;

type Axis = 'x' | 'z';

interface Laid {
	mesh: THREE.Mesh;
	x: number;
	z: number;
	w: number;
	d: number;
	squash: number;
}

interface Falling {
	mesh: THREE.Mesh;
	v: THREE.Vector3;
	spin: THREE.Vector3;
}

interface Flash {
	mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
	t: number;
}

export type DropResult = { kind: 'laid' | 'perfect'; score: number } | { kind: 'miss'; score: number };

const jitter = (a: number, b: number) => a + (b - a) * Math.random();

export function createStack(parent: THREE.Object3D, base: number, brick: THREE.Texture) {
	const group = new THREE.Group();
	group.name = 'game-stack';
	parent.add(group);

	// the tower's mudbrick, scaled so one brick shows a few courses of it
	const tex = brick.clone();
	tex.repeat.set(0.5, 0.11);
	tex.needsUpdate = true;
	const ochre = new THREE.Color(0xc98b4a), deep = new THREE.Color(0xa9713a), lime = new THREE.Color(0xe9e3d3);
	const palette = new Map<number, THREE.MeshStandardMaterial>();
	function materialFor(level: number) {
		const key = level % 5 === 4 ? -1 : Math.round(((Math.sin(level * 0.7) + 1) / 2) * (TONES - 1));
		let m = palette.get(key);
		if (!m) {
			const color = key < 0 ? lime.clone() : ochre.clone().lerp(deep, key / (TONES - 1));
			m = new THREE.MeshStandardMaterial({ color, map: tex, bumpMap: tex, bumpScale: 1.2, roughness: 0.92 });
			palette.set(key, m);
		}
		return m;
	}

	let laid: Laid[] = [];
	let falling: Falling[] = [];
	let flashes: Flash[] = [];
	let moving: { mesh: THREE.Mesh; w: number; d: number } | null = null;
	let axis: Axis = 'x';
	let phase = 0;
	let speed = SPEED0;
	let score = 0;
	let over = false;
	let camTop = base;

	const removeMesh = (m: THREE.Mesh) => {
		group.remove(m);
		m.geometry.dispose();
	};
	const top = () => (laid.length ? laid[laid.length - 1] : { x: 0, z: 0, w: BS, d: BS });

	function block(w: number, d: number, level: number) {
		const m = new THREE.Mesh(new THREE.BoxGeometry(w, BH, d), materialFor(level));
		m.castShadow = m.receiveShadow = true;
		group.add(m);
		return m;
	}

	/** The next brick enters from one side of the one below, alternating x and z. */
	function spawn() {
		const prev = top(), level = laid.length;
		axis = level % 2 === 0 ? 'x' : 'z';
		const m = block(prev.w, prev.d, level);
		m.position.set(prev.x, base + level * BH + BH / 2, prev.z);
		phase = -Math.PI / 2;
		m.position[axis] = prev[axis] - AMP;
		moving = { mesh: m, w: prev.w, d: prev.d };
	}

	function flash(m: THREE.Mesh, w: number, d: number) {
		const mesh = new THREE.Mesh(
			new THREE.PlaneGeometry(w + 0.3, d + 0.3),
			new THREE.MeshBasicMaterial({
				color: new THREE.Color(3, 2.2, 1.1),
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
			}),
		);
		mesh.rotation.x = -Math.PI / 2;
		mesh.position.set(m.position.x, m.position.y - BH / 2 + 0.02, m.position.z);
		group.add(mesh);
		flashes.push({ mesh, t: 0 });
	}

	function clearMoving() {
		if (moving) removeMesh(moving.mesh);
		moving = null;
	}

	/** Removes every brick, slice and flash. */
	function clear() {
		laid.forEach((b) => removeMesh(b.mesh));
		falling.forEach((f) => removeMesh(f.mesh));
		flashes.forEach((f) => {
			group.remove(f.mesh);
			f.mesh.geometry.dispose();
			f.mesh.material.dispose();
		});
		clearMoving();
		laid = [];
		falling = [];
		flashes = [];
	}

	/** Clears the stack (and anything still falling) and starts a new run on the bare plinth. */
	function reset() {
		clear();
		over = false;
		score = 0;
		speed = SPEED0;
		spawn();
	}

	function drop(): DropResult | null {
		if (!moving || over) return null;
		const prev = top(), mv = moving, ax = axis;
		const size = ax === 'x' ? mv.w : mv.d;
		let delta = mv.mesh.position[ax] - prev[ax];
		moving = null;

		// missed the stack: the whole brick tumbles off and the run is over
		if (Math.abs(delta) >= size) {
			const v = new THREE.Vector3();
			v[ax] = Math.sign(delta) * 2;
			falling.push({ mesh: mv.mesh, v, spin: new THREE.Vector3(jitter(-2, 2), 0, jitter(-2, 2)) });
			over = true;
			return { kind: 'miss', score };
		}

		const perfect = Math.abs(delta) < PERFECT;
		if (perfect) {
			mv.mesh.position[ax] = prev[ax];
			delta = 0;
		} else {
			// keep the part over the brick below, and let the overhang fall
			const keep = size - Math.abs(delta), cut = Math.abs(delta), centre = prev[ax] + delta / 2, dir = Math.sign(delta);
			const w = ax === 'x' ? keep : mv.w, d = ax === 'z' ? keep : mv.d;
			mv.mesh.geometry.dispose();
			mv.mesh.geometry = new THREE.BoxGeometry(w, BH, d);
			const slice = new THREE.Mesh(new THREE.BoxGeometry(ax === 'x' ? cut : w, BH, ax === 'z' ? cut : d), mv.mesh.material);
			slice.castShadow = true;
			slice.position.copy(mv.mesh.position);
			slice.position[ax] = centre + dir * (keep / 2 + cut / 2);
			mv.mesh.position[ax] = centre;
			mv.w = w;
			mv.d = d;
			group.add(slice);
			const v = new THREE.Vector3();
			v[ax] = dir * 1.6;
			// it tips over its cut edge as it goes
			const spin = new THREE.Vector3(ax === 'z' ? dir * 2.5 : jitter(-0.5, 0.5), 0, ax === 'x' ? -dir * 2.5 : jitter(-0.5, 0.5));
			falling.push({ mesh: slice, v, spin });
		}

		laid.push({ mesh: mv.mesh, x: mv.mesh.position.x, z: mv.mesh.position.z, w: mv.w, d: mv.d, squash: 1 });
		if (perfect) flash(mv.mesh, mv.w, mv.d);
		score++;
		speed = Math.min(SPEED_MAX, speed * 1.045);
		spawn();
		return { kind: perfect ? 'perfect' : 'laid', score };
	}

	function update(dt: number) {
		if (moving && !over) {
			phase += dt * speed;
			const prev = top();
			moving.mesh.position[axis] = prev[axis] + Math.sin(phase) * AMP;
		}
		for (let i = falling.length - 1; i >= 0; i--) {
			const f = falling[i];
			f.v.y -= GRAVITY * dt;
			f.mesh.position.addScaledVector(f.v, dt);
			f.mesh.rotation.x += f.spin.x * dt;
			f.mesh.rotation.z += f.spin.z * dt;
			if (f.mesh.position.y < base - 45) {
				removeMesh(f.mesh);
				falling.splice(i, 1);
			}
		}
		// a laid brick gives a little as it lands
		for (const b of laid) {
			if (b.squash > 0.001) {
				b.squash *= Math.exp(-dt * 9);
				b.mesh.scale.y = 1 - 0.22 * Math.sin(b.squash * Math.PI);
			} else b.mesh.scale.y = 1;
		}
		for (let i = flashes.length - 1; i >= 0; i--) {
			const f = flashes[i];
			f.t += dt * 1.8;
			f.mesh.scale.setScalar(1 + f.t * 0.6);
			f.mesh.material.opacity = Math.max(0, 1 - f.t);
			if (f.t >= 1) {
				group.remove(f.mesh);
				f.mesh.geometry.dispose();
				f.mesh.material.dispose();
				flashes.splice(i, 1);
			}
		}
		camTop += (base + laid.length * BH - camTop) * damp(3, dt);
	}

	let disposed = false;
	return {
		/** The height the game camera looks at: the top of the stack, smoothed. */
		get camTop() {
			return camTop;
		},
		get score() {
			return score;
		},
		get over() {
			return over;
		},
		/** Nothing is in motion that needs frames to finish (slices falling, flashes fading). */
		get idle() {
			return falling.length === 0 && flashes.length === 0;
		},
		reset,
		drop,
		update,
		clearMoving,
		/** Puts every laid brick at rest, for when the frames stop coming. */
		settle() {
			for (const b of laid) {
				b.squash = 0;
				b.mesh.scale.y = 1;
			}
		},
		dispose() {
			if (disposed) return;
			disposed = true;
			clear();
			parent.remove(group);
			palette.forEach((m) => m.dispose());
			palette.clear();
			tex.dispose();
		},
	};
}

export type Stack = ReturnType<typeof createStack>;

