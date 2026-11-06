/**
 * The sky dome, the lights and the climb's weather. Altitude 0..1 runs dawn (base) → day →
 * golden dusk → starry night (summit); sky, sun, fog, light and window glow all follow it.
 */
import * as THREE from 'three';
import { lerp, sstep } from './util';

/** Altitude keyframes: dawn, day, dusk, night. */
const KA = [0, 0.38, 0.72, 1];
const colors = (hex: string[]) => hex.map((h) => new THREE.Color(h));
const ENV = {
	top: colors(['#4f73a3', '#6f8fb3', '#3c5a86', '#0b1330']),
	horizon: colors(['#f2a877', '#c9d6e2', '#e8a678', '#2a3a62']),
	sun: colors(['#ffb877', '#fff1dc', '#ffa565', '#a9bcff']),
	hemiSky: colors(['#a8c0dd', '#bcd0e6', '#f0b890', '#3a4c80']),
	hemiGround: colors(['#8a6a44', '#8a7450', '#6e4f38', '#1e2030']),
	cloud: colors(['#ffe2cc', '#ffffff', '#ffc9a6', '#4b5a85']),
	sunI: [2.6, 3.1, 2.5, 0.8],
	hemiI: [1.05, 1.25, 0.95, 0.75],
	elevation: [11, 46, 15, 32],
	azimuth: [0.95, 0.55, -0.75, -0.5],
	stars: [0, 0, 0.12, 1],
	rays: [0.32, 0.06, 0.38, 0],
	windows: [0.14, 0.05, 0.7, 2.3],
	exposure: [1.0, 1.0, 0.98, 1.2],
};

function segment(a: number) {
	for (let i = 0; i < 3; i++) if (a <= KA[i + 1]) return { i, t: sstep(0, 1, (a - KA[i]) / (KA[i + 1] - KA[i])) };
	return { i: 2, t: 1 };
}
const kf = (arr: number[], a: number) => {
	const { i, t } = segment(a);
	return lerp(arr[i], arr[i + 1], t);
};
const kc = (arr: THREE.Color[], a: number, out: THREE.Color) => {
	const { i, t } = segment(a);
	return out.lerpColors(arr[i], arr[i + 1], t);
};

const vertexShader = /* glsl */ `
	varying vec3 vDir;
	void main() {
		vDir = position;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}`;

const fragmentShader = /* glsl */ `
	varying vec3 vDir;
	uniform vec3 uTop, uHorizon, uGround, uSunDir, uSunCol;
	uniform float uStars, uRays, uTime;
	float hash(vec3 p) { p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
	void main() {
		vec3 d = normalize(vDir);
		float h = d.y;
		vec3 col = mix(uHorizon, uTop, pow(smoothstep(-0.02, 0.62, h), 0.75));
		col = mix(col, uGround, smoothstep(0.0, -0.12, h));
		// the sun: a hot disc, a halo and a wide glow
		vec3 sd = normalize(uSunDir);
		float s = max(dot(d, sd), 0.0);
		col += uSunCol * (pow(s, 900.0) * 9.0 + pow(s, 30.0) * 0.32 + pow(s, 4.0) * 0.14);
		// crepuscular rays fanning around the sun
		vec3 t1 = normalize(cross(sd, vec3(0.0, 1.0, 0.0)) + 1e-4);
		vec3 t2 = cross(sd, t1);
		float ang = atan(dot(d, t2), dot(d, t1));
		float ray = 0.5 + 0.5 * sin(ang * 23.0 + sin(ang * 7.0) * 2.0 + uTime * 0.04);
		col += uSunCol * uRays * pow(s, 3.0) * ray * smoothstep(-0.04, 0.12, h);
		// twinkling stars, denser along a milky band
		if (uStars > 0.001) {
			vec3 p = d * 260.0;
			vec3 c = floor(p);
			vec3 f = fract(p) - 0.5;
			float r = hash(c);
			float st = step(0.982, r) * smoothstep(0.32, 0.0, length(f));
			float tw = 0.6 + 0.4 * sin(uTime * 2.5 + r * 90.0);
			float band = 0.5 + 0.5 * smoothstep(0.75, 0.0, abs(dot(d, normalize(vec3(0.4, 0.6, 0.7)))));
			col += vec3(1.0, 0.95, 0.85) * st * tw * uStars * 2.6 * smoothstep(0.02, 0.3, h) * band;
		}
		gl_FragColor = vec4(col, 1.0);
	}`;

/** What the rest of the scene reads from the weather each frame. */
export interface Atmosphere {
	/** Brightness multiplier for lit windows and torches (rises toward night). */
	windowGlow: number;
	cloud: THREE.Color;
	top: THREE.Color;
	horizon: THREE.Color;
	exposure: number;
}

export function createSky(scene: THREE.Scene, { narrow = false } = {}) {
	const fog = new THREE.Fog(0xf3b98a, 90, 430);
	scene.fog = fog;

	const uniforms = {
		uTop: { value: new THREE.Color() },
		uHorizon: { value: new THREE.Color() },
		uGround: { value: new THREE.Color(0x6b5a44) },
		uSunDir: { value: new THREE.Vector3(1, 0.2, 0) },
		uSunCol: { value: new THREE.Color() },
		uStars: { value: 0 },
		uRays: { value: 0 },
		uTime: { value: 0 },
	};
	const dome = new THREE.Mesh(
		new THREE.SphereGeometry(1400, 48, 24),
		new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms, vertexShader, fragmentShader }),
	);
	dome.renderOrder = -10;
	scene.add(dome);

	const hemi = new THREE.HemisphereLight(0xbcd0e6, 0x8a6a44, 1.1);
	scene.add(hemi);

	const sun = new THREE.DirectionalLight(0xffffff, 3);
	sun.castShadow = true;
	const map = narrow ? 1024 : 2048;
	sun.shadow.mapSize.set(map, map);
	// the shadow frustum hugs the tower (±30 around its axis)
	const frustum = sun.shadow.camera;
	frustum.left = frustum.bottom = -30;
	frustum.right = frustum.top = 30;
	frustum.near = 1;
	frustum.far = 520;
	sun.shadow.bias = -0.0004;
	sun.shadow.normalBias = 0.05;
	sun.target.position.set(0, 18, 0);
	scene.add(sun, sun.target);

	const atmosphere: Atmosphere = {
		windowGlow: 0,
		cloud: new THREE.Color(),
		top: uniforms.uTop.value,
		horizon: uniforms.uHorizon.value,
		exposure: 1,
	};
	const sunDir = new THREE.Vector3();

	/** Sets the weather for altitude `a` (0..1); the sun swings with the camera so it stays in view. */
	function update(a: number, camTh: number, time: number, camera: THREE.Camera) {
		kc(ENV.top, a, uniforms.uTop.value);
		kc(ENV.horizon, a, uniforms.uHorizon.value);
		fog.color.copy(uniforms.uHorizon.value);
		fog.far = lerp(430, 520, a);
		fog.near = lerp(90, 120, a);

		kc(ENV.sun, a, sun.color);
		sun.intensity = kf(ENV.sunI, a);
		uniforms.uSunCol.value.copy(sun.color).multiplyScalar(a > 0.85 ? 0.55 : 1);
		kc(ENV.hemiSky, a, hemi.color);
		kc(ENV.hemiGround, a, hemi.groundColor);
		hemi.intensity = kf(ENV.hemiI, a);

		const el = THREE.MathUtils.degToRad(kf(ENV.elevation, a));
		const az = camTh + kf(ENV.azimuth, a);
		sunDir.set(Math.cos(az) * Math.cos(el), Math.sin(el), Math.sin(az) * Math.cos(el));
		uniforms.uSunDir.value.copy(sunDir);
		sun.position.copy(sun.target.position).addScaledVector(sunDir, 140);

		uniforms.uStars.value = kf(ENV.stars, a);
		uniforms.uRays.value = kf(ENV.rays, a);
		uniforms.uTime.value = time;
		dome.position.copy(camera.position);

		atmosphere.windowGlow = kf(ENV.windows, a);
		atmosphere.exposure = kf(ENV.exposure, a);
		kc(ENV.cloud, a, atmosphere.cloud);
		return atmosphere;
	}

	return { update, atmosphere };
}

