/**
 * Small math helpers shared by every scene module, plus the seeded random source.
 * The tower is procedural: one fixed seed keeps it identical on every visit.
 */
export const TAU = Math.PI * 2;

export const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/** Hermite smoothstep of x between a and b. */
export const sstep = (a: number, b: number, x: number) => {
	const t = clamp((x - a) / (b - a), 0, 1);
	return t * t * (3 - 2 * t);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Frame-rate independent approach factor: `x += (target - x) * damp(rate, dt)`. */
export const damp = (rate: number, dt: number) => 1 - Math.exp(-dt * rate);

/** Shortest signed angle between two angles, in (-π, π]. */
export const angleDelta = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

export function mulberry32(seed: number) {
	let a = seed;
	return function () {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Deterministic 2D hash in [0, 1), used to colour the patchwork fields. */
export const hash2 = (x: number, z: number) => {
	const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
	return s - Math.floor(s);
};

export type Rng = () => number;

/** A random source with a ranged helper, created once per scene so rebuilds are identical. */
export function createRandom(seed: number) {
	const rnd: Rng = mulberry32(seed);
	const range = (a: number, b: number) => a + (b - a) * rnd();
	return { rnd, range };
}

export type Random = ReturnType<typeof createRandom>;

/** The layout breakpoint the CSS uses (47.5rem); below it the panel docks at the bottom. */
export const isNarrow = () => window.innerWidth < 760;

