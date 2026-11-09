<script setup lang="ts">
/**
 * The 3D Tower of Babel: one progressive-enhancement island over the static home page.
 * Mounted with `client:only`, so without JavaScript nothing of it exists. Once the page has
 * painted it checks the visitor can take it (WebGL 2, no reduced-motion preference, no
 * Save-Data), and only then downloads the scene and Three.js as a separate chunk. Without it, or
 * on any failure on the way (no GPU, a failed download, a lost context), the page climbs over the
 * still picture instead (./still-climb.ts).
 *
 * While the scene is live it also mounts game mode's UI (TowerGame), handing it the scene handle.
 *
 * Debug: `?no3d` keeps the static page, `?noshadow` renders without shadows.
 */
import { markRaw, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import { endLoading } from './mode';
import { createStillClimb, type StillClimb } from './still-climb';
import TowerGame from './TowerGame.vue';
import type { GameCopy } from '../../i18n/home';
import type { DoorSpec, PortraitSpec, TowerHandle } from './scene';

const props = defineProps<{
	/** Tier ids in climbing order (sections `#tier-<id>`). */
	tiers: string[];
	/** One doorway per project card, in card order. */
	doors: DoorSpec[];
	/** The self-portrait hung beside the strings on the making tier. */
	portrait: PortraitSpec;
	/** Game mode's copy (HUD, game-over card, toast, toggle labels). */
	game: GameCopy;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
/** Bumped after a teardown so a restart gets a fresh canvas (and a fresh GL context). */
const generation = ref(0);
/** The live scene, for game mode's UI; null while there is none (static page, teardown). */
const live = shallowRef<TowerHandle | null>(null);
const gameUi = ref<InstanceType<typeof TowerGame> | null>(null);

let handle: TowerHandle | null = null;
let starting = false;
let alive = true;
let lost = false;
let motion: MediaQueryList | null = null;

function hasWebGL2() {
	try {
		const gl = document.createElement('canvas').getContext('webgl2');
		gl?.getExtension('WEBGL_lose_context')?.loseContext();
		return !!gl;
	} catch {
		return false;
	}
}

function wanted() {
	if (lost || motion?.matches) return false;
	if (new URLSearchParams(location.search).has('no3d')) return false;
	const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
	if (connection?.saveData) return false;
	return true;
}

/** Resolves once the static page has painted and the main thread has a quiet moment. */
function afterFirstPaint() {
	return new Promise<void>((resolve) => {
		requestAnimationFrame(() =>
			requestAnimationFrame(() => {
				if ('requestIdleCallback' in window) window.requestIdleCallback(() => resolve(), { timeout: 1500 });
				else setTimeout(resolve, 200);
			}),
		);
	});
}

/**
 * Without the live tower the page still climbs, over the still picture (../home/StaticTower.astro):
 * the same panels, sheets, keys and stops. It runs whenever there is no scene, and hands the page
 * over to one as it activates.
 */
let still: StillClimb | null = null;
function goStill() {
	if (!alive || handle || still) return;
	still = createStillClimb({ tiers: props.tiers, projects: props.doors });
}
function stopStill(handBack: boolean) {
	still?.dispose(handBack);
	still = null;
}

/**
 * Every way out of start() lifts the full-screen loader (TowerLoader): on success the scene has
 * already switched the root to `html.webgl`, so the loader fades out over the live tower; on any
 * bail-out it fades out over the still climb.
 */
async function start() {
	if (handle || starting || !wanted() || !hasWebGL2()) {
		// a start already in flight owns the loader; it lifts it when it finishes
		if (!handle && !starting) {
			goStill();
			endLoading();
		}
		return;
	}
	starting = true;
	try {
		await afterFirstPaint();
		const { createTowerScene } = await import('./scene');
		if (!alive || !wanted() || !canvas.value) return;
		handle = await createTowerScene({
			canvas: canvas.value,
			tiers: props.tiers,
			doors: props.doors,
			portrait: props.portrait,
			onLost() {
				lost = true;
				stop();
			},
			// the still climb gives the page back as the scene switches it into its own climb
			onActivate: () => stopStill(true),
		});
		if (!alive || !wanted()) stop();
		else live.value = markRaw(handle);
	} catch (err) {
		console.warn('tower: staying on the still picture', err);
		stop();
	} finally {
		starting = false;
		// whatever went wrong on the way, the page climbs without it
		if (!handle) goStill();
		endLoading();
	}
}

function stop() {
	if (!handle) return;
	// leave game mode (page classes, inert, focus) before the scene it runs in goes away
	gameUi.value?.shutdown();
	live.value = null;
	handle.dispose();
	handle = null;
	generation.value++;
	goStill();
}

// turning reduced motion on mid-visit drops back to the static page; turning it off climbs again
async function onMotionChange() {
	if (motion?.matches) stop();
	else {
		await nextTick();
		start();
	}
}

onMounted(() => {
	motion = window.matchMedia('(prefers-reduced-motion: reduce)');
	motion.addEventListener('change', onMotionChange);
	start();
});

onBeforeUnmount(() => {
	alive = false;
	motion?.removeEventListener('change', onMotionChange);
	stop();
	stopStill(false);
});
</script>

<template>
	<canvas :key="generation" ref="canvas" class="tower-canvas" aria-hidden="true" />
	<div class="tower-veil tower-veil--vignette" aria-hidden="true" />
	<div class="tower-veil tower-veil--grain" aria-hidden="true" />
	<TowerGame v-if="live" ref="gameUi" :tower="live" :copy="game" />
</template>

<style scoped>
/*
 * The canvas sits fixed behind the content (z-index 0, before the tiers in document order, so
 * every later positioned element paints over it). It stays transparent until the scene has
 * rendered its first frames and the root switches to `html.webgl`, then fades in over the sky.
 */
.tower-canvas,
.tower-veil {
	position: fixed;
	inset: 0;
	z-index: 0;
	inline-size: 100%;
	block-size: 100%;
	pointer-events: none;
	opacity: 0;
	transition: opacity 1.2s var(--sd-ease);
}

.tower-canvas {
	display: block;
}

html.webgl .tower-canvas {
	opacity: 1;
}

/* a soft vignette and a film of grain, so the render reads as painted rather than computed */
.tower-veil--vignette {
	background: radial-gradient(120% 90% at 50% 45%, transparent 55%, rgb(20 17 14 / 0.38) 100%);
}

.tower-veil--grain {
	mix-blend-mode: overlay;
	background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}

html.webgl .tower-veil--vignette {
	opacity: 1;
}

html.webgl .tower-veil--grain {
	opacity: 0.09;
}
</style>

