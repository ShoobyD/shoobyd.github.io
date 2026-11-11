/**
 * The climb camera: a helix around the tower that parks at each tier. Scroll progress p (0..5)
 * picks a point between two parks; the camera eases into each park and bulges outward between
 * them so it arcs around the ramp instead of grazing it. A slow intro dolly, a little pointer
 * parallax and a view offset (keeping the tower clear of the panel side) are layered on top.
 */
import * as THREE from 'three';
import { damp, lerp, sstep } from './util';
import { LAST_TIER, PARK, type OrbitView, type Park } from './dimensions';

/** Interpolated park for progress `p`. */
export function rigAt(p: number, out: Park): Park {
	let i = Math.floor(p), t = p - i;
	if (i >= LAST_TIER) {
		i = LAST_TIER - 1;
		t = 1;
	}
	// mostly eased so the camera settles at each park, with some linear drift so it never stalls
	const te = lerp(t, sstep(0, 1, t), 0.7);
	const A = PARK[i], B = PARK[i + 1];
	out.th = lerp(A.th, B.th, te);
	out.dist = lerp(A.dist, B.dist, te) + Math.sin(t * Math.PI) * 6;
	out.y = lerp(A.y, B.y, te);
	out.look = lerp(A.look, B.look, te);
	return out;
}

const UP = new THREE.Vector3(0, 1, 0);
const _axis = new THREE.Vector3();
const _q = new THREE.Quaternion();

/**
 * Turns a shot (camera position and target) rigidly about `center`: by `yaw` around the vertical,
 * then by `pitch` up over it (negative: from below), and draws it in by `zoom`. The centre keeps
 * its place in the frame while everything behind it swings past.
 */
export function orbitShot(shot: { pos: THREE.Vector3; look: THREE.Vector3 }, center: THREE.Vector3, v: OrbitView) {
	for (const p of [shot.pos, shot.look]) {
		p.sub(center).applyAxisAngle(UP, v.yaw);
	}
	// the pitch turns about the level axis across the line of sight
	_axis.copy(shot.pos).setY(0).cross(UP).normalize();
	_q.setFromAxisAngle(_axis, v.pitch);
	for (const p of [shot.pos, shot.look]) {
		p.applyQuaternion(_q).multiplyScalar(v.zoom).add(center);
	}
}

export interface RigInput {
	dt: number;
	time: number;
	/** Smoothed scroll progress, 0 (base) .. 5 (summit). */
	progress: number;
	/** 0 at the start of the intro dolly, 1 once it has landed. */
	intro: number;
	/** Smoothed pointer in -1..1 on both axes. */
	pointer: { x: number; y: number };
	/** +1 when the panel sits on the right (RTL), -1 when on the left (LTR). */
	side: number;
	narrow: boolean;
	/** An extra turn around the tower, in radians (the code tier's walk from door to door). */
	pan?: number;
}

export function createCameraRig(camera: THREE.PerspectiveCamera) {
	const park: Park = { th: 0, dist: 0, y: 0, look: 0 };
	const pos = new THREE.Vector3();
	const look = new THREE.Vector3();
	let side = NaN;
	let th = 0;

	return {
		pos,
		look,
		get theta() {
			return th;
		},
		/** Computes this frame's climb position and target (not yet applied to the camera). */
		update(s: RigInput) {
			rigAt(s.progress, park);
			const away = 1 - s.intro;
			const sway = s.pointer.x * 0.04 + Math.sin(s.time * 0.15) * 0.012;
			th = park.th + away * -0.7 + sway + (s.pan ?? 0);
			const dist = park.dist * (s.narrow ? 1.38 : 1) + away * 48;
			const y = park.y + away * 10 - s.pointer.y * 0.7;
			pos.set(Math.cos(th) * dist, y, Math.sin(th) * dist);
			look.set(0, park.look + away * 4, 0);
			// glide to the other side when the direction flips (he ↔ en)
			side = Number.isNaN(side) ? s.side : side + (s.side - side) * damp(4, s.dt);
		},
		/**
		 * Points the camera. `framing` (0..1) scales the view offset that keeps the tower clear of
		 * the panel; a takeover such as game mode can lower it to centre the tower. On narrow
		 * screens the panel is a bottom sheet and the tower is lifted instead, by `lift` px: into
		 * the middle of the room the sheet leaves (see ./sheet.ts), 20% of the height without one.
		 */
		apply(target: { pos: THREE.Vector3; look: THREE.Vector3 }, narrow: boolean, framing = 1, lift?: number) {
			camera.position.copy(target.pos);
			camera.lookAt(target.look);
			const w = window.innerWidth, h = window.innerHeight;
			const offX = narrow ? 0 : side * w * 0.155 * framing;
			const offY = narrow ? (lift ?? h * 0.2) * framing : 0;
			camera.setViewOffset(w, h, offX, offY, w, h);
			camera.updateProjectionMatrix();
		},
		resize(narrow: boolean) {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.fov = narrow ? 54 : 40;
		},
	};
}

export type CameraRig = ReturnType<typeof createCameraRig>;

