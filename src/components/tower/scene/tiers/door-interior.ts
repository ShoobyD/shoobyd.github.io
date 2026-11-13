/**
 * What lies behind the code tier's doorways, without cutting the wall (interior mapping). Each
 * doorway stays a flat arch at the wall; its shader follows the view ray from each pixel into the
 * space behind it and paints whichever surface it meets first, so that space moves in true
 * perspective as the camera walks past.
 *
 * - An **open** doorway looks into the hall: one ring-shaped hall inside the tier, shared by every
 *   open doorway. The ray goes through the wall's thickness (the doorway's plaster reveal), then on
 *   to the hall's stone-flagged floor, its beamed ceiling, its pilastered inner wall or the inside
 *   of the outer wall. Each open doorway hangs a lamp just inside it, and every lamp lights the
 *   whole hall, so a look along it finds the next doorway's pool of light; the lamps show as soft
 *   halos. A door's light is its lamp's power: the door in focus burns brightest.
 * - A **bricked** doorway is a shallow recess, plastered at its sides, walled up at its back in a
 *   brick of its own.
 */
import * as THREE from 'three';

/** The hall, in the tower group's space: shared by every open doorway's material. */
export interface Hall {
	/** Radius of the hall's inner wall, and of the outer wall's inside face. */
	rIn: number;
	rOut: number;
	/** Floor and ceiling heights. */
	floor: number;
	ceiling: number;
	/** One lamp per open doorway, just inside it (up to MAX_LAMPS), and how bright each burns. */
	lamps: THREE.Vector3[];
	power: number[];
}

export const MAX_LAMPS = 8;

/** A lamp at rest burns at this power; the door in focus raises its own toward LAMP_LIT. */
export const LAMP_REST = 0.5;
export const LAMP_LIT = 3.6;

export interface InteriorOptions {
	/** The doorway's width and height (its arch fits inside them). */
	w: number;
	h: number;
	kind: 'hall' | 'bricked';
	/** The bricked recess's depth. */
	depth: number;
	brick: THREE.Texture;
	hall: Hall;
}

const vertex = /* glsl */ `
	varying vec3 vPos;
	#include <common>
	#include <logdepthbuf_pars_vertex>
	void main() {
		vPos = position;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		#include <logdepthbuf_vertex>
	}
`;

const fragment = /* glsl */ `
	#define MAX_LAMPS ${MAX_LAMPS}
	uniform vec3 uEye;
	uniform vec3 uSize;
	uniform vec3 uTint;
	uniform sampler2D uBrick;
	uniform float uHallKind;
	uniform mat4 uToTower;
	uniform vec4 uHall; // rIn, rOut, floor, ceiling
	uniform vec3 uLamps[MAX_LAMPS];
	uniform float uLampPower[MAX_LAMPS];
	uniform int uLampCount;
	varying vec3 vPos;
	#include <common>
	#include <logdepthbuf_pars_fragment>

	float hash(vec2 p) {
		return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
	}
	float noise(vec2 p) {
		vec2 i = floor(p), f = fract(p);
		f = f * f * (3.0 - 2.0 * f);
		return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
	}
	// lime plaster: a warm wash, faintly mottled
	vec3 plaster(vec2 p) {
		float m = noise(p * 6.0) * 0.6 + noise(p * 19.0) * 0.4;
		return vec3(0.6, 0.49, 0.36) * (0.9 + 0.16 * m);
	}
	// a floor of stone slabs in running courses, with darker joints
	vec3 flags(vec2 p) {
		vec2 q = p / vec2(0.5, 0.42);
		q.x += floor(q.y) * 0.5;
		vec2 f = fract(q);
		float joint = smoothstep(0.0, 0.05, min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y)));
		vec3 slab = vec3(0.56, 0.49, 0.4) * (0.86 + 0.2 * hash(floor(q))) * (0.94 + 0.1 * noise(p * 14.0));
		return slab * mix(0.55, 1.0, joint);
	}

	// distances along the ray to the doorway box's sides and to its floor or top
	float boxSide(vec3 dir) {
		return ((dir.x > 0.0 ? uSize.x : -uSize.x) * 0.5 - vPos.x) / (abs(dir.x) < 1e-4 ? 1e-4 : dir.x);
	}
	float boxFlat(vec3 dir) {
		return ((dir.y > 0.0 ? uSize.y : 0.0) - vPos.y) / (abs(dir.y) < 1e-4 ? 1e-4 : dir.y);
	}

	// a bricked doorway: a shallow recess, its back walled up
	vec3 recess(vec3 dir) {
		float d = uSize.z;
		float tBack = (-d - vPos.z) / min(dir.z, -1e-4);
		float tSide = boxSide(dir), tFlat = boxFlat(dir);
		float t = min(tBack, min(tSide, tFlat));
		vec3 p = vPos + dir * t;
		float back = clamp(-p.z / d, 0.0, 1.0); // 0 at the doorway, 1 at the back
		if (t == tBack) return texture2D(uBrick, vec2(p.x / uSize.x + 0.5, p.y / uSize.y) * vec2(0.9, 1.4)).rgb * 0.56;
		if (t == tSide) return plaster(vec2(-p.z, p.y)) * mix(0.62, 0.42, back);
		if (dir.y < 0.0) return flags(vec2(p.x, -p.z)) * mix(0.5, 0.36, back);
		return plaster(vec2(p.x, -p.z)) * 0.3;
	}

	// the light the hall's lamps cast at a point
	vec3 lampLight(vec3 p) {
		vec3 sum = vec3(0.018, 0.014, 0.012); // a breath of ambient, so the hall is never pitch black
		for (int i = 0; i < MAX_LAMPS; i++) {
			if (i >= uLampCount) break;
			vec3 l = uLamps[i] - p;
			sum += vec3(1.0, 0.6, 0.28) * 3.2 * uLampPower[i] / (1.0 + dot(l, l) * 0.9);
		}
		return sum;
	}

	// the lamps themselves, seen along the ray before it meets a surface: a soft warm halo each
	vec3 lampGlow(vec3 o, vec3 d, float tHit) {
		vec3 sum = vec3(0.0);
		for (int i = 0; i < MAX_LAMPS; i++) {
			if (i >= uLampCount) break;
			float t = dot(uLamps[i] - o, d);
			if (t < 0.0 || t > tHit) continue;
			vec3 near = o + d * t - uLamps[i];
			float r2 = dot(near, near);
			sum += vec3(1.0, 0.68, 0.34) * uLampPower[i] * (0.9 * exp(-r2 * 40.0) + 0.25 * exp(-r2 * 3.0));
		}
		return sum;
	}

	// the near (entering) or far (leaving) distance along a ray to a vertical cylinder about the axis
	float cylinder(vec2 o, vec2 d, float r, float side) {
		float a = dot(d, d), b = 2.0 * dot(o, d), c = dot(o, o) - r * r;
		float disc = b * b - 4.0 * a * c;
		if (disc < 0.0 || a < 1e-6) return 1e9;
		float t = (-b + side * sqrt(disc)) / (2.0 * a);
		return t > 1e-3 ? t : 1e9;
	}

	// an open doorway: the hall every open doorway shares
	vec3 hall(vec3 dir) {
		vec3 o = (uToTower * vec4(vPos, 1.0)).xyz;
		vec3 d = normalize(mat3(uToTower) * dir);
		// through the wall first: the doorway's own reveal, until the ray is inside the outer wall
		float tIn = cylinder(o.xz, d.xz, uHall.y, -1.0);
		float tReveal = min(boxSide(dir), boxFlat(dir));
		if (tReveal < tIn) {
			vec3 p = o + d * tReveal;
			return plaster(vec2(vPos.z + dir.z * tReveal, p.y)) * lampLight(p) * 0.8;
		}
		float tFloor = d.y < 0.0 ? (uHall.z - o.y) / d.y : 1e9;
		float tCeil = d.y > 0.0 ? (uHall.w - o.y) / d.y : 1e9;
		float tInner = cylinder(o.xz, d.xz, uHall.x, -1.0);
		float tOuter = cylinder(o.xz, d.xz, uHall.y, 1.0);
		float t = min(min(tFloor, tCeil), min(tInner, tOuter));
		vec3 p = o + d * t;
		float ang = atan(p.z, p.x);
		float rad = length(p.xz);
		vec3 col;
		if (t == tFloor) {
			col = flags(vec2(ang * rad, rad));
		} else if (t == tCeil) {
			// dark timber beams across a plaster vault
			float beam = step(0.82, fract(ang * rad / 1.4));
			col = mix(plaster(vec2(ang * rad, rad)) * 0.7, vec3(0.16, 0.1, 0.06), beam);
		} else if (t == tInner) {
			// the inner wall: plaster between pilasters, over a darker base course
			float s = fract(ang * uHall.x / 2.2);
			float pil = smoothstep(0.0, 0.03, s) * (1.0 - smoothstep(0.17, 0.2, s));
			col = plaster(vec2(ang * uHall.x, p.y));
			col *= mix(1.0, 0.72, pil);
			col *= mix(0.6, 1.0, smoothstep(0.35, 0.45, p.y - uHall.z));
		} else {
			col = plaster(vec2(ang * uHall.y, p.y)) * 0.9;
		}
		return col * lampLight(p) + lampGlow(o, d, t);
	}

	void main() {
		#include <logdepthbuf_fragment>
		vec3 dir = normalize(vPos - uEye);
		vec3 col = uHallKind > 0.5 ? hall(dir) : recess(dir) * uTint;
		gl_FragColor = vec4(col, 1.0);
		#include <tonemapping_fragment>
		#include <colorspace_fragment>
	}
`;

export function createInteriorMaterial(o: InteriorOptions) {
	const { hall } = o;
	const lamps = Array.from({ length: MAX_LAMPS }, (_, i) => hall.lamps[i] ?? new THREE.Vector3());
	const uniforms = {
		uEye: { value: new THREE.Vector3() },
		uSize: { value: new THREE.Vector3(o.w, o.h, o.depth) },
		uTint: { value: new THREE.Color(1, 0.8, 0.66) },
		uBrick: { value: o.brick },
		uHallKind: { value: o.kind === 'hall' ? 1 : 0 },
		uToTower: { value: new THREE.Matrix4() },
		uHall: { value: new THREE.Vector4(hall.rIn, hall.rOut, hall.floor, hall.ceiling) },
		uLamps: { value: lamps },
		uLampPower: { value: hall.power },
		uLampCount: { value: Math.min(hall.lamps.length, MAX_LAMPS) },
	};
	const material = new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment });
	return {
		material,
		/** Call from the doorway mesh's onBeforeRender: the eye in the doorway's own space, and the
		 * doorway's place in the tower group (its parent). */
		look(mesh: THREE.Object3D, camera: THREE.Camera) {
			uniforms.uEye.value.setFromMatrixPosition(camera.matrixWorld);
			mesh.worldToLocal(uniforms.uEye.value);
			uniforms.uToTower.value.copy(mesh.matrix);
		},
	};
}

