/**
 * Code tier: a sign on a bricked doorway, for a project in development. A desktop screenshot of the
 * project in a limestone frame (like the self-portrait's on the making tier), hung in the arch on
 * two cords from a nail in the doorframe's keystone, in front of the caution tape (which twists out
 * up to about 0.19 from the wall), swaying a little, slowly. Hung by hand, not by a ruler: each sign
 * (by its seed, so the same on every visit) is a little larger or smaller, hangs a little higher or
 * lower, leans to one side and turns a touch off the wall.
 * When its project is lit (its card in focus or hovered, or the sign itself pointed at), the frame
 * warms like a lit doorway's and the screenshot brightens.
 *
 * In the doorway's own space (its foot at y = 0, out of the wall toward +z), like the tapes.
 */
import * as THREE from 'three';
import type { Materials } from '../materials';
import { mulberry32 } from '../util';

/**
 * The screenshot's width (it keeps a desktop's 16:10), the frame's border round it, and its depth.
 * Wider than the doorway (1.5): it hangs in front of the doorframe, over part of it. Thick enough
 * that its edge, seen almost end on as it turns off the wall, still reads as one strip.
 */
const WIDTH = 1.95;
const HEIGHT = WIDTH * 0.625;
const BORDER = 0.06;
const DEPTH = 0.08;
/**
 * The nail, in the face of the doorframe's keystone; how far below it the plaque's top hangs, and
 * how far out from it (so the plaque clears the tape).
 */
const NAIL = new THREE.Vector3(0, 2.86, 0.2);
const DROP = 0.48;
const OUT = 0.18;
/** The cords meet the plaque this far in from its sides. */
const CORD_IN = 0.14;

const WARM = new THREE.Color(1, 0.62, 0.3);
/** The screenshot's own light: white at rest, warm when its project is lit. */
const SHOT_REST = new THREE.Color(1, 1, 1);
const SHOT_LIT = new THREE.Color(1, 0.8, 0.55);
/** How far the halo of a lit sign spreads past its frame. */
const HALO = 0.5;

/**
 * A soft warm glow round a rectangle, fading out to its edges: the halo behind a lit sign. Its
 * full core is as large as the sign in front of it (which hides it), so what shows round the sign
 * is the glow at its brightest, fading away over the `HALO` past it. Drawn once, as a canvas, and
 * shared; the halo's plane is the sign's size plus `HALO` all round, and about two-thirds of it is
 * the sign, so the core spans the canvas's middle two-thirds.
 */
let haloTexture: THREE.CanvasTexture | null = null;
function halo() {
	if (haloTexture) return haloTexture;
	const c = document.createElement('canvas');
	c.width = c.height = 128;
	const g = c.getContext('2d')!;
	g.shadowColor = 'rgb(255, 176, 102)';
	g.shadowBlur = 18;
	g.fillStyle = 'rgb(255, 176, 102)';
	g.fillRect(22, 22, 84, 84);
	haloTexture = new THREE.CanvasTexture(c);
	haloTexture.colorSpace = THREE.SRGBColorSpace;
	return haloTexture;
}

export function createSign(url: string, mats: Materials, anisotropy: number, seed: number) {
	const rnd = mulberry32(seed * 97 + 13);
	const range = (lo: number, hi: number) => lo + rnd() * (hi - lo);
	// its own size and drop, its lean (to either side, by turns) and its turn off the wall
	const size = range(0.92, 1.06);
	const width = WIDTH * size, height = HEIGHT * size;
	const drop = DROP + range(-0.08, 0.08);
	const lean = (seed % 2 ? 1 : -1) * range(0.035, 0.07);
	const turn = range(-0.04, 0.04);

	const group = new THREE.Group();
	// what sways: everything below the nail, about the nail
	const hanging = new THREE.Group();
	hanging.position.copy(NAIL);
	group.add(hanging);

	const texture = new THREE.TextureLoader().load(url);
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.anisotropy = anisotropy;

	const top = -drop;
	const centre = top - BORDER - height / 2;
	const stone = mats.limestone.clone();
	stone.emissive = WARM.clone();
	stone.emissiveIntensity = 0;
	const frame = new THREE.Mesh(new THREE.BoxGeometry(width + BORDER * 2, height + BORDER * 2, DEPTH), stone);
	frame.position.set(0, centre, OUT);
	frame.castShadow = true;
	// the screenshot is lit partly of its own, as a backlit sign: in the sun it reads as before, and
	// the warm light of its lit project (./doors.ts) warms it without washing a pale one out to white
	const face = new THREE.MeshStandardMaterial({
		map: texture,
		color: 0x9e9e9e,
		emissiveMap: texture,
		emissive: 0xffffff,
		emissiveIntensity: 0.4,
		roughness: 0.6,
		metalness: 0,
	});
	const shot = new THREE.Mesh(new THREE.PlaneGeometry(width, height), face);
	shot.position.set(0, centre, OUT + DEPTH / 2 + 0.002);
	shot.receiveShadow = true;
	// lit, a warm halo spreads round it from behind, as a lit doorway's glow: its own light, so it
	// shows the same from every side, on a dark screenshot or a pale one
	const glow = new THREE.MeshBasicMaterial({
		map: halo(),
		transparent: true,
		opacity: 0,
		blending: THREE.AdditiveBlending,
		depthWrite: false,
	});
	const aura = new THREE.Mesh(new THREE.PlaneGeometry(width + BORDER * 2 + HALO * 2, height + BORDER * 2 + HALO * 2), glow);
	aura.position.set(0, centre, OUT - DEPTH / 2 - 0.01);
	aura.visible = false;

	// two cords from the nail to the plaque's top edge, and the nail itself
	const cords = [-1, 1].map((side) => {
		const end = new THREE.Vector3(side * (width / 2 + BORDER - CORD_IN), top, OUT);
		const length = end.length();
		const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, length, 5), mats.ink);
		cord.position.copy(end).multiplyScalar(0.5);
		cord.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().normalize());
		return cord;
	});
	const nail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 8), mats.ink);
	nail.rotation.x = Math.PI / 2;
	hanging.add(aura, frame, shot, ...cords, nail);

	const phase = seed * 1.7;
	return {
		group,
		/** The screenshot, for the pointer to find. */
		hit: shot,
		/** The plaque's corners in world space, for the gallery to grow out of. */
		corners() {
			shot.updateWorldMatrix(true, false);
			return [
				[-1, -1],
				[1, -1],
				[1, 1],
				[-1, 1],
			].map(([x, y]) => new THREE.Vector3((x * width) / 2, (y * height) / 2, 0).applyMatrix4(shot.matrixWorld));
		},
		/**
		 * `lit` (0..1) brings up the halo, warms the frame and the screenshot's own light; the light
		 * that falls on the sign and the bricks round it is the doorways' (./doors.ts).
		 */
		update(time: number, lit: number) {
			// a slow sway about the nail, a touch toward and away from the wall too
			hanging.rotation.z = lean + Math.sin(time * 0.6 + phase) * 0.012;
			hanging.rotation.x = Math.sin(time * 0.43 + phase * 0.7) * 0.01;
			hanging.rotation.y = turn;
			stone.emissiveIntensity = lit * 0.6;
			glow.opacity = lit * 0.85;
			aura.visible = lit > 0.01;
			face.emissive.copy(SHOT_REST).lerp(SHOT_LIT, lit);
			face.emissiveIntensity = 0.4 + lit * 0.12;
		},
	};
}

export type Sign = ReturnType<typeof createSign>;

