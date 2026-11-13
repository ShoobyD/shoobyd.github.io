/**
 * Caution tape across a bricked doorway: the project behind it is still being built. Two or three
 * strips of yellow-and-black tape stretched between the doorway's sides, just in front of the
 * bricks, each at its own height and slant, sagging under its own weight and turning a little
 * along its length; sometimes one has torn loose at one end and hangs down. Their ends tuck into
 * the frame's inner sides, so the tape never crosses the frame.
 *
 * Neighbouring doorways get different arrangements, each varied by a seed, so no two look alike,
 * and the same doorway looks the same on every visit.
 */
import * as THREE from 'three';
import { mulberry32 } from '../util';

/** The doorway's half-width (to the frame's inner sides) and the tape's width. */
const HALF = 0.77;
const WIDTH = 0.14;

/** Yellow and black bands, square to the tape's length so they slant once it's laid across. */
function tapeTexture() {
	const c = document.createElement('canvas');
	c.width = 128;
	c.height = 32;
	const g = c.getContext('2d')!;
	g.fillStyle = '#f2c200';
	g.fillRect(0, 0, 128, 32);
	g.fillStyle = '#1c1a17';
	for (let x = -64; x < 160; x += 32) {
		g.beginPath();
		g.moveTo(x, 32);
		g.lineTo(x + 16, 32);
		g.lineTo(x + 32, 0);
		g.lineTo(x + 16, 0);
		g.closePath();
		g.fill();
	}
	const tex = new THREE.CanvasTexture(c);
	tex.wrapS = THREE.RepeatWrapping;
	tex.colorSpace = THREE.SRGBColorSpace;
	tex.anisotropy = 4;
	return tex;
}

/**
 * A ribbon along `path` (in the doorway's space), `WIDTH` across, turning by `twist(t)` radians
 * about its own length; the bands repeat every `WIDTH * 2.6` along it.
 */
function ribbon(path: THREE.Curve<THREE.Vector3>, twist: (t: number) => number, segments = 40) {
	const pos: number[] = [], uv: number[] = [], idx: number[] = [];
	const length = path.getLength();
	const up = new THREE.Vector3(0, 1, 0), side = new THREE.Vector3(), across = new THREE.Vector3();
	const tangent = new THREE.Vector3(), out = new THREE.Vector3(0, 0, 1);
	for (let i = 0; i <= segments; i++) {
		const t = i / segments;
		const p = path.getPointAt(t);
		path.getTangentAt(t, tangent);
		// across the tape: square to its length, in the doorway's plane, then turned by the twist
		side.crossVectors(out, tangent).normalize();
		if (side.lengthSq() < 1e-6) side.copy(up);
		across.copy(side).applyAxisAngle(tangent, twist(t)).multiplyScalar(WIDTH / 2);
		pos.push(p.x - across.x, p.y - across.y, p.z - across.z, p.x + across.x, p.y + across.y, p.z + across.z);
		const u = (t * length) / (WIDTH * 2.6);
		uv.push(u, 0, u, 1);
		if (i < segments) {
			const a = i * 2;
			idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
		}
	}
	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
	geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
	geo.setIndex(idx);
	geo.computeVertexNormals();
	return geo;
}

/** A tape stretched from one side to the other, sagging by `sag` at its middle. */
function stretched(y0: number, y1: number, z: number, sag: number, flip: boolean) {
	const a = new THREE.Vector3(flip ? HALF : -HALF, y0, z);
	const b = new THREE.Vector3(flip ? -HALF : HALF, y1, z);
	const mid = a.clone().lerp(b, 0.5);
	mid.y -= sag * 2; // a quadratic's middle sits halfway to its control point
	mid.z += 0.02;
	return new THREE.QuadraticBezierCurve3(a, mid, b);
}

/**
 * A tape torn loose: still held at one side, it runs a short way across, bends over under its own
 * weight and hangs straight down to its free end.
 */
function torn(y: number, z: number, reach: number, drop: number, flip: boolean) {
	const s = flip ? -1 : 1;
	return new THREE.CubicBezierCurve3(
		new THREE.Vector3(-HALF * s, y, z),
		new THREE.Vector3((-HALF + reach) * s, y, z + 0.01),
		new THREE.Vector3((-HALF + reach) * s, y - 0.1, z + 0.02),
		new THREE.Vector3((-HALF + reach * 0.96) * s, y - drop, z + 0.02),
	);
}

/**
 * The tapes across one bricked doorway, in the doorway's own space (its foot at y = 0). `layout`
 * picks the arrangement (the doorway's count among the bricked ones), so neighbours differ; the
 * seed varies the heights, slants and sags within it.
 */
export function createTapes(seed: number, layout: number, material: THREE.Material) {
	const rnd = mulberry32(seed);
	const range = (lo: number, hi: number) => lo + rnd() * (hi - lo);
	const group = new THREE.Group();
	const add = (curve: THREE.Curve<THREE.Vector3>, twist: (t: number) => number) => {
		const mesh = new THREE.Mesh(ribbon(curve, twist), material);
		mesh.castShadow = true;
		group.add(mesh);
	};
	const flip = rnd() < 0.5;
	const turn = (k: number, amp: number) => (t: number) => Math.sin(t * Math.PI * k) * amp;
	switch (layout % 3) {
		case 0:
			// a long tape falling steeply across, a second near level below it, and a torn one
			// hanging from the side the first starts low on
			add(stretched(range(1.55, 1.75), range(0.6, 0.75), 0.05, range(0.05, 0.08), flip), turn(1, range(0.25, 0.4)));
			add(stretched(range(1.0, 1.1), range(0.9, 1.0), 0.09, range(0.06, 0.09), !flip), turn(1.5, range(0.15, 0.3)));
			add(torn(range(0.85, 0.95), 0.07, range(0.2, 0.26), range(0.62, 0.72), flip), (t) => t * 0.2);
			break;
		case 1:
			// three tapes at a slight slant each, as if strung in a hurry one after another
			add(stretched(range(1.55, 1.65), range(1.4, 1.5), 0.05, range(0.07, 0.1), flip), turn(1, range(0.2, 0.35)));
			add(stretched(range(1.05, 1.15), range(1.15, 1.25), 0.075, range(0.05, 0.08), flip), turn(1.5, range(0.15, 0.3)));
			add(stretched(range(0.55, 0.65), range(0.7, 0.8), 0.1, range(0.08, 0.11), !flip), turn(1, range(0.2, 0.35)));
			break;
		default:
			// an X: two tapes crossing at opposite slants
			add(stretched(range(1.45, 1.6), range(0.6, 0.75), 0.05, range(0.04, 0.07), flip), turn(1, range(0.2, 0.4)));
			add(stretched(range(1.45, 1.6), range(0.6, 0.75), 0.09, range(0.04, 0.07), !flip), turn(1.5, range(0.15, 0.3)));
	}
	return group;
}

export function tapeMaterial() {
	return new THREE.MeshStandardMaterial({ map: tapeTexture(), roughness: 0.55, metalness: 0, side: THREE.DoubleSide });
}

