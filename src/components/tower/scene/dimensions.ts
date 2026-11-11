/**
 * The tower's measurements and the camera's parking spots, shared by the builders,
 * the per-tier moments and the camera path.
 */
import * as THREE from 'three';
import { TAU, clamp } from './util';

/** Height of one tier, and the plaza level the first tier stands on. */
export const TH = 6;
export const Y0 = 0.4;
/** Radius of each of the five built tiers, tapering upward. */
export const R = [15, 12.6, 10.4, 8.4, 6.6];
export const TIERS = R.length;
/** The unfinished summit ring: radius and floor height. */
export const R5 = 5.0;
export const Y5 = Y0 + TIERS * TH;
/** The top of the summit plinth: where game mode (step 6c) lays its first brick. */
export const PLINTH_TOP = Y5 + 2.0;
/** How much each tier's wall leans inward over its height. */
export const BATTER = 0.016;

export const yb = (i: number) => Y0 + i * TH;
export const rAt = (i: number, y: number) => R[i] * (1 - BATTER * clamp((y - yb(i)) / TH, 0, 1));

export interface Park {
	/** Angle around the tower axis. */
	th: number;
	/** Distance from the axis. */
	dist: number;
	/** Camera height. */
	y: number;
	/** Height on the axis the camera looks at. */
	look: number;
}

/** Where the camera parks for each tier, base → summit. */
export const PARK: Park[] = [
	{ th: 0.55, dist: 72, y: 6.5, look: 19.5 },
	{ th: 2.2, dist: 39, y: 11.5, look: 9.6 },
	{ th: 3.8, dist: 37, y: 18.5, look: 15.8 },
	{ th: 5.4, dist: 34, y: 24.5, look: 21.6 },
	{ th: 7.0, dist: 31, y: 30.5, look: 27.4 },
	{ th: 8.6, dist: 29, y: 44.5, look: 36 },
];
export const LAST_TIER = PARK.length - 1;

/** The ramp starts behind the code tier's park so its handrail frames the doorways. */
export const RAMP_A0 = PARK[1].th - 0.8 * TAU;

/** Angular spacing of the project doorways on the code tier. */
export const DOOR_STEP = 0.27;

/**
 * How far the camera turns toward the doorway in focus on the code tier, as a share of the door's
 * angle from the park (most of the way, so its neighbours stay in view).
 */
export const DOOR_PAN = 0.8;

/** A shot around the armillary sphere: turned about it (yaw, pitch, in radians) and drawn in (zoom, a share of the distance). */
export interface OrbitView {
	yaw: number;
	pitch: number;
	zoom: number;
}

/**
 * The experience tier's shots, one per stop of its path (the degree first): the camera swings
 * around the armillary sphere from side to side, every shot from a side of its own (none goes back
 * to one already taken, so no move is undone by the next), and each move another way: across, up
 * or down, and nearer each time. The first, wide (farther out than the park), goes on from the way
 * the camera arrives (behind: climbing, it turns against a positive yaw); the last, today's, is the
 * whole sphere almost head-on, from below after the one from above before it, and the nearest; the
 * exit goes on from it, onward and up (see camera-path.ts, orbitShot).
 */
export const PATH_VIEWS: OrbitView[] = [
	{ yaw: 0.3, pitch: 0.01, zoom: 1.2 },
	{ yaw: -0.2, pitch: -0.05, zoom: 0.86 },
	{ yaw: 0.18, pitch: 0.23, zoom: 0.72 },
	{ yaw: -0.03, pitch: -0.17, zoom: 0.6 },
];

/** The widest turn of that walk either way, for `count` doorways. */
export const doorPanMax = (count: number) => ((Math.max(1, count) - 1) / 2) * DOOR_STEP * DOOR_PAN;

/** Angles of `count` doorways, centred on the code tier's park. */
export const doorAngles = (count: number) =>
	Array.from({ length: count }, (_, k) => PARK[1].th + (k - (count - 1) / 2) * DOOR_STEP);

/** A point in front of tier `i`'s park, at radius `r` and height `y`. */
export const tierPos = (i: number, r: number, y: number) =>
	new THREE.Vector3(Math.cos(PARK[i].th) * r, y, Math.sin(PARK[i].th) * r);

