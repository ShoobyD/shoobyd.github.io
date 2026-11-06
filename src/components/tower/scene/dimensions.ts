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
	{ th: 8.6, dist: 29, y: 45, look: 33.2 },
];
export const LAST_TIER = PARK.length - 1;

/** The ramp starts behind the code tier's park so its handrail frames the doorways. */
export const RAMP_A0 = PARK[1].th - 0.8 * TAU;

/** Angular spacing of the project doorways on the code tier. */
export const DOOR_STEP = 0.27;

/** Angles of `count` doorways, centred on the code tier's park. */
export const doorAngles = (count: number) =>
	Array.from({ length: count }, (_, k) => PARK[1].th + (k - (count - 1) / 2) * DOOR_STEP);

/** A point in front of tier `i`'s park, at radius `r` and height `y`. */
export const tierPos = (i: number, r: number, y: number) =>
	new THREE.Vector3(Math.cos(PARK[i].th) * r, y, Math.sin(PARK[i].th) * r);

