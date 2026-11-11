/**
 * The Tower of Babel scene: builds the world, wires it to the page, and runs the climb.
 * This module (and Three.js with it) is loaded on demand by TowerScene.vue, only once the
 * page has painted and the browser has passed the WebGL / reduced-motion checks.
 *
 * The page is laid out as the climb from its first paint (TowerLoaderBoot). Activation is the
 * last step: the scene renders its first frames behind it (under the loader, or behind the still
 * climb if it starts mid-visit), whatever ran the panels lets go of them (`onActivate`), and the
 * root gets `html.webgl`: the scene runs the climb from the tier the visitor is on.
 */
import * as THREE from 'three';
import { clamp, createRandom, damp, easeOut, isNarrow, lerp, sstep } from './util';
import { DOOR_PAN, DOOR_STEP, LAST_TIER, PATH_VIEWS, PLINTH_TOP, doorAngles, doorPanMax, type OrbitView } from './dimensions';
import { createRenderer } from './renderer';
import { createSky } from './sky';
import { createLandscape } from './landscape';
import { createMaterials } from './materials';
import { brickTexture } from './textures';
import { createTower } from './tower';
import { createFigures } from './figures';
import { createSummit } from './summit';
import { createClouds } from './clouds';
import { createCameraRig, orbitShot } from './camera-path';
import type { Climb } from './climb';
import type { Sheet } from './sheet';
import { createPageClimb, type PageClimb } from './page-climb';
import { createLoop } from './loop';
import { disposeScene } from './dispose';
import { createDoors, type DoorSpec } from './tiers/doors';
import { ARMILLARY_TIER, createArmillary } from './tiers/armillary';
import { createGlyphs } from './tiers/glyphs';
import { STRING_COUNT, createStrings } from './tiers/strings';
import { createGuitarSound } from './tiers/guitar-sound';
import { createPortrait, type PortraitSpec } from './tiers/portrait';
import { TOWER_CLASS, progressAt, sectionHolds, sectionTops } from '../mode';

export type { DoorSpec, PortraitSpec };
// game mode rides in this chunk; it plugs in through the handle below and nothing else
export { createGame, type Game, type GameEvents } from './game';

export interface TowerOptions {
	canvas: HTMLCanvasElement;
	/** Tier ids in climbing order; each has a section `#tier-<id>` holding a `[data-tier-panel]`. */
	tiers: readonly string[];
	/** One doorway per project card (`[data-project="<id>"]`), in card order. */
	doors: DoorSpec[];
	/** The self-portrait hung beside the strings on the making tier. */
	portrait: PortraitSpec;
	/** Called if the GPU drops the context; the caller tears the scene down (the still climb takes over). */
	onLost?: () => void;
	/**
	 * Called as the scene takes the climb over: whatever ran the panels until then (the still
	 * climb) lets go of them first.
	 */
	onActivate?: () => void;
}

/**
 * A takeover of the camera, for game mode (game/director.ts): while set, its target is blended
 * in by `blend` (0 = the climb, 1 = fully the director's shot), and the panel framing and the
 * panels themselves ease out with it.
 */
export interface Director {
	update(dt: number, time: number): { pos: THREE.Vector3; look: THREE.Vector3; blend: number; altitude?: number };
}

export interface TowerHandle {
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	tower: THREE.Group;
	/** The top of the summit plinth, where a game would lay its first brick. */
	plinthTop: number;
	brick: THREE.Texture;
	goTier(i: number): void;
	setDirector(d: Director | null): void;
	dispose(): void;
}

/** Every piece of the world, built in a fixed order so the seeded random gives the same tower each visit. */
function buildWorld(
	scene: THREE.Scene,
	tower: THREE.Group,
	anisotropy: number,
	doorSpecs: DoorSpec[],
	portraitSpec: PortraitSpec,
	narrow: boolean,
) {
	const random = createRandom(1188);
	const mats = createMaterials();
	const brick = brickTexture(random.rnd, anisotropy);
	const sky = createSky(scene, { narrow });
	const landscape = createLandscape(scene, random);
	const angles = doorAngles(doorSpecs.length);
	const built = createTower(tower, random, mats, brick, angles);
	const doors = createDoors(tower, mats, brick, doorSpecs, angles);
	const figures = createFigures(tower, random);
	const summit = createSummit(tower, random, mats, brick);
	const armillary = createArmillary(scene);
	const glyphs = createGlyphs(scene, random);
	const strings = createStrings(scene, mats);
	const portrait = createPortrait(scene, mats, portraitSpec, anisotropy);
	// the camera's walk along the code tier's doors widens that stop's view, and its clouds keep clear of all of it
	const clouds = createClouds(scene, random, doorPanMax(doorSpecs.length));
	return { brick, sky, landscape, built, doors, figures, summit, armillary, glyphs, strings, portrait, clouds };
}

const pointerInUi = (t: EventTarget | null) =>
	!!(t as Element | null)?.closest?.('[data-tier-panel], header, nav, a, button');

export async function createTowerScene(opts: TowerOptions): Promise<TowerHandle> {
	const root = document.documentElement;
	const params = new URLSearchParams(location.search);

	const sections = opts.tiers.map((id) => document.getElementById(`tier-${id}`));
	if (sections.some((s) => !s)) throw new Error('tower: tier sections missing');
	const sectionEls = sections as HTMLElement[];
	const panels = sectionEls.map((s) => s.querySelector<HTMLElement>('[data-tier-panel]'));
	if (panels.some((p) => !p)) throw new Error('tower: tier panels missing');
	const panelEls = panels as HTMLElement[];

	// ---------- the world ----------
	let narrow = isNarrow();
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(narrow ? 54 : 40, window.innerWidth / window.innerHeight, 0.4, 3000);
	const stage = createRenderer(opts.canvas, scene, camera, { shadows: !params.has('noshadow') });
	const tower = new THREE.Group();
	scene.add(tower);
	let world: ReturnType<typeof buildWorld>;
	try {
		world = buildWorld(scene, tower, stage.maxAnisotropy, opts.doors, opts.portrait, narrow);
	} catch (err) {
		// nothing is on the page yet; free what was built and let the caller fall back to the still climb
		disposeScene(scene);
		stage.dispose();
		throw err;
	}
	const { brick, sky, landscape, built, doors, figures, summit, armillary, glyphs, strings, clouds } = world;
	const rig = createCameraRig(camera);

	// ---------- page wiring ----------
	const pointer = { x: 0, y: 0, sx: 0, sy: 0, ndc: new THREE.Vector2(), lastX: 0, lastY: 0, moved: false, inUi: false };
	/** The strings' notes; silent until the visitor's first click, tap or key press. */
	const guitar = createGuitarSound();
	let nearest = 0;
	let doorHover = -1;
	let summitHover = false;

	/**
	 * Fingers have no hover to show that the summit's top can be tapped, so on touch screens a cue
	 * (`[data-summit-cue]`, a zero-size anchor in the page) floats over it while the climb is parked
	 * at the summit, outside the game, with the summit's sheet collapsed (an open one covers the top).
	 */
	const cue = document.querySelector<HTMLElement>('[data-summit-cue]');
	const touch = window.matchMedia('(hover: none)');
	const cuePoint = new THREE.Vector3(0, PLINTH_TOP + 5.2, 0);
	const cueScreen = new THREE.Vector3();
	let cueOn = false;
	function placeCue() {
		if (!cue) return;
		const sheetOpen = narrow && !panelEls[LAST_TIER].classList.contains('is-sheet-collapsed');
		const on = touch.matches && !!climb && !director && Math.abs(smooth - LAST_TIER) < 0.12 && !sheetOpen;
		if (on !== cueOn) {
			cueOn = on;
			cue.classList.toggle('is-on', on);
		}
		if (!on) return;
		cueScreen.copy(cuePoint).project(camera);
		const x = ((cueScreen.x + 1) / 2) * window.innerWidth;
		const y = ((1 - cueScreen.y) / 2) * window.innerHeight;
		// the anchor sits at the viewport's inline-start corner: the right one in RTL
		const dx = root.dir === 'rtl' ? x - window.innerWidth : x;
		cue.style.transform = `translate3d(${dx.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
	}
	function onPointerMove(e: PointerEvent) {
		pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
		pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
		pointer.ndc.set(pointer.x, -pointer.y);
		pointer.moved = true;
		pointer.inUi = pointerInUi(e.target);
		const dx = e.clientX - pointer.lastX;
		const dy = e.clientY - pointer.lastY;
		// a mouse or pen strums on any sweep; a finger only on a sideways swipe, because a vertical
		// swipe is the scroll that climbs the tower (the page is `touch-action: pan-y` in 3D mode,
		// so the browser leaves sideways moves to us and takes vertical ones as a scroll)
		if (nearest === 4 && (e.pointerType !== 'touch' || Math.abs(dx) > Math.abs(dy))) {
			// each string the pointer crossed rings and sounds its note, harder for a faster sweep
			const strength = Math.min(1, Math.max(0.35, Math.hypot(dx, dy) / 40));
			for (const k of strings.track(pointer.ndc, camera)) {
				strings.pluck(k, strength);
				// heard where it stands: the low strings to the left, the high ones to the right
				guitar.pluck(k, strength, (((STRING_COUNT - 1) / 2 - k) / STRING_COUNT) * 0.8);
			}
		} else {
			strings.resetTracking();
		}
		pointer.lastX = e.clientX;
		pointer.lastY = e.clientY;
	}
	// a new touch starts from where the finger lands, not from where the last one lifted
	function onPointerDown(e: PointerEvent) {
		pointer.lastX = e.clientX;
		pointer.lastY = e.clientY;
		strings.resetTracking();
	}
	// clicking a doorway opens its project, and clicking the unfinished top starts the game (the
	// game UI listens for `tower:play`); the pick happens at click time so taps work too
	function onClick(e: MouseEvent) {
		if ((nearest !== 1 && nearest !== LAST_TIER) || !climb || pointerInUi(e.target) || director) return;
		const ndc = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
		if (nearest === LAST_TIER) {
			if (summit.pick(ndc, camera)) window.dispatchEvent(new CustomEvent('tower:play'));
			return;
		}
		const i = doors.pick(ndc, camera);
		const href = i >= 0 ? opts.doors[i].href : undefined;
		if (href) window.location.href = href;
	}
	window.addEventListener('pointermove', onPointerMove, { passive: true });
	window.addEventListener('pointerdown', onPointerDown, { passive: true });
	window.addEventListener('click', onClick);

	// ---------- activation: the scene takes the climb over where the visitor is ----------
	// Until the first frames are on screen the camera reads the page's progress; then whatever
	// ran the panels lets go of them and the scene runs the climb from the same scroll position.
	// the page's side of the climb (./page-climb.ts): its progress and keys, and on narrow screens
	// the bottom sheets (./sheet.ts), here for short
	let page: PageClimb | null = null;
	let climb: Climb | null = null;
	let sheet: Sheet | null = null;
	let lift: number | null = null;
	/** Where the visitor is (a link straight to a tier, `/#tier-summit`, lands on its park). */
	const readingNow = () => progressAt(sectionTops(sectionEls), window.scrollY, sectionHolds(sectionEls));
	let smooth = readingNow();
	const intro = { from: 0, play: smooth < 0.05 };
	let enter = 0;

	function activate(now: number) {
		opts.onActivate?.();
		const reading = readingNow();
		root.classList.add(TOWER_CLASS);
		page = createPageClimb({
			sections: sectionEls,
			panels: panelEls,
			tiers: opts.tiers,
			projects: opts.doors,
			startTier: Math.round(reading),
			// the lit project's doorway, here in the tower
			onLight: (i) => doors.setHot(i),
		});
		({ climb, sheet } = page);
		smooth = climb.progress;
		// the intro dolly only plays when arriving at the base
		intro.play = reading < 0.05;
		intro.from = now;
	}

	function onResize() {
		narrow = isNarrow();
		stage.setSize(window.innerWidth, window.innerHeight);
		rig.resize(narrow);
		climb?.measure();
	}
	window.addEventListener('resize', onResize);
	// section heights change with the window, and the page's height with the footer's content
	const layoutWatch = new ResizeObserver(() => climb?.measure());
	layoutWatch.observe(document.body);

	function onContextLost(e: Event) {
		e.preventDefault();
		opts.onLost?.();
	}
	opts.canvas.addEventListener('webglcontextlost', onContextLost);

	// ---------- the frame ----------
	let director: Director | null = null;
	const shot = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
	let time = 0;
	let frames = 0;

	/**
	 * On the code tier the camera walks along the wall to the doorway of the project in focus:
	 * it turns toward that door (DOOR_PAN of the way, so its neighbours stay in view), settling on
	 * each door as the scroll passes it. Arriving from below it starts at the first door, and
	 * leaving upward it sets off from the last; the turn fades out as the climb moves away.
	 */
	let doorAt = 0;
	function doorPan(dt: number) {
		const count = opts.doors.length;
		if (count < 2) return 0;
		const stop = climb?.stop;
		let to: number;
		if (stop && stop.tier === 1) {
			const k = Math.floor(stop.at);
			to = Math.min(count - 1, k + sstep(0.2, 0.8, stop.at - k));
		} else to = smooth < 1 ? 0 : count - 1;
		doorAt += (to - doorAt) * damp(4, dt);
		const near = 1 - sstep(0, 0.45, Math.abs(smooth - 1));
		return near * (doorAt - (count - 1) / 2) * DOOR_STEP * DOOR_PAN;
	}

	/**
	 * On the experience tier each stop of the path has its own shot of the armillary sphere
	 * (PATH_VIEWS): the camera circles it to another side, from below or above, nearer or farther,
	 * gliding from one to the next as the scroll passes between the stops. Below the tier the
	 * degree's shot waits, above it today's; the shot fades out as the climb moves away.
	 */
	const pathStops = Math.min(PATH_VIEWS.length, Number(sectionEls[ARMILLARY_TIER]?.dataset.stops) || 1);
	let pathAt = 0;
	const pathView: OrbitView = { yaw: 0, pitch: 0, zoom: 1 };
	function pathShot(dt: number): OrbitView | null {
		// it fades in over the last stretch of the climb up to the tier, and out over the whole way
		// on to the next, so today's shot (from above) hands over to the climb without a dip
		const d = smooth - ARMILLARY_TIER;
		const near = 1 - sstep(0, d > 0 ? 0.9 : 0.45, Math.abs(d));
		if (pathStops < 2 || near <= 0) return null;
		const stop = climb?.stop;
		let to: number;
		if (stop && stop.tier === ARMILLARY_TIER) {
			const k = Math.floor(stop.at);
			to = Math.min(pathStops - 1, k + sstep(0.15, 0.85, stop.at - k));
		} else to = smooth < ARMILLARY_TIER ? 0 : pathStops - 1;
		pathAt += (to - pathAt) * damp(2.6, dt);
		const k = Math.min(pathStops - 2, Math.floor(pathAt));
		const t = sstep(0, 1, pathAt - k);
		const A = PATH_VIEWS[k], B = PATH_VIEWS[k + 1];
		pathView.yaw = lerp(A.yaw, B.yaw, t) * near;
		pathView.pitch = lerp(A.pitch, B.pitch, t) * near;
		pathView.zoom = lerp(1, lerp(A.zoom, B.zoom, t), near);
		return pathView;
	}
	// dev only: `?tune` puts a panel on the page for trying the shots live (./dev-tune.ts)
	if (import.meta.env.DEV && new URLSearchParams(location.search).has('tune')) {
		void import('./dev-tune').then((m) => m.createPathTuner(PATH_VIEWS, sectionEls[ARMILLARY_TIER]));
	}

	const loop = createLoop((dt, now) => {
		time += dt;
		const target = climb ? climb.progress : progressAt(sectionTops(sectionEls), window.scrollY, sectionHolds(sectionEls));
		smooth = climb ? smooth + (target - smooth) * damp(3.2, dt) : target;
		if (Math.abs(target - smooth) < 1e-4) smooth = target;
		nearest = Math.round(smooth);

		pointer.sx += (pointer.x - pointer.sx) * damp(2, dt);
		pointer.sy += (pointer.y - pointer.sy) * damp(2, dt);
		const landed = !intro.play ? 1 : climb ? easeOut(clamp((now - intro.from) / 3600, 0, 1)) : 0;
		const side = root.dir === 'ltr' ? -1 : 1;
		rig.update({ dt, time, progress: smooth, intro: landed, pointer: { x: pointer.sx, y: pointer.sy }, side, narrow, pan: doorPan(dt) });

		// a director (game mode) can take the camera over; the climb shot is blended toward its own
		shot.pos.copy(rig.pos);
		shot.look.copy(rig.look);
		// on the experience tier, the stop's shot around the armillary sphere
		const around = pathShot(dt);
		if (around) orbitShot(shot, armillary.center, around);
		let blend = 0;
		let altitude = clamp(smooth / LAST_TIER, 0, 1);
		if (director) {
			const d = director.update(dt, time);
			blend = d.blend;
			shot.pos.lerp(d.pos, blend);
			shot.look.lerp(d.look, blend);
			if (d.altitude !== undefined) altitude = lerp(altitude, d.altitude, blend);
		}
		// narrow screens: the tower rises into the room above the sheet in view, following it as it
		// opens, collapses or is dragged (eased, so changing tiers doesn't jolt the frame)
		const liftTo = narrow && sheet ? sheet.lift(nearest) : null;
		if (liftTo === null) lift = null;
		else lift = lift === null ? liftTo : lift + (liftTo - lift) * damp(9, dt);
		rig.apply(shot, narrow, 1 - blend, lift ?? undefined);

		const atmo = sky.update(altitude, rig.theta, time, camera);
		stage.renderer.toneMappingExposure = atmo.exposure;
		landscape.update(atmo);
		built.update(atmo);
		clouds.update(dt, time, camera, atmo);
		figures.update(dt, time);
		// the unfinished top lights up under a hovering pointer (a finger has no hover: it just taps)
		const overTop = nearest === LAST_TIER && !!climb && !director && pointer.moved && !pointer.inUi && summit.pick(pointer.ndc, camera);
		if (overTop !== summitHover) {
			summitHover = overTop;
			summit.setHot(overTop);
			document.body.style.cursor = overTop ? 'pointer' : '';
		}
		summit.update(time, dt);
		placeCue();
		// the sphere builds up with the experience tier's path (page-climb.ts): all off until the camera
		// nears the tier, lighting as its panel fades in (half shown about 0.3 of a tier away, climb.ts),
		// and its stage in focus only while the camera is there (above it, all lit and none in focus)
		const fromSphere = smooth - ARMILLARY_TIER;
		armillary.update(time, dt, page && fromSphere > -0.3 ? page.pathLevel : -1, Math.abs(fromSphere) < 0.3);
		glyphs.update(time, smooth);
		strings.update(dt, time, smooth);

		// doorway hover, raycast only while the code tier is in view
		if (nearest === 1 && !director && pointer.moved && !pointer.inUi) {
			const dh = doors.pick(pointer.ndc, camera);
			if (dh !== doorHover) {
				doorHover = dh;
				document.body.style.cursor = dh >= 0 ? 'pointer' : '';
			}
		} else if (doorHover >= 0) {
			doorHover = -1;
			document.body.style.cursor = '';
		}
		// the lit project: the doorway under the pointer, or the code tier's stop
		page?.light(doorHover, !!director);
		doors.update(dt, time);

		if (page) {
			enter = Math.min(1, enter + dt / 0.7);
			// a director's shot fades the panels out with it (game mode hides them)
			page.update(smooth, easeOut(enter) * (1 - blend));
		}

		stage.render(dt);
		// two frames in, everything is compiled and on the canvas: switch the page into the climb
		if (++frames === 2 && !climb) activate(now);
	});

	let disposed = false;
	const handle: TowerHandle = {
		scene,
		camera,
		tower,
		plinthTop: PLINTH_TOP,
		brick,
		goTier: (i) => climb?.goTier(i),
		setDirector(d) {
			director = d;
		},
		dispose() {
			if (disposed) return;
			disposed = true;
			loop.dispose();
			// the page stays the climb, where it is: the still climb takes it from there
			page?.dispose();
			root.classList.remove(TOWER_CLASS);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('click', onClick);
			window.removeEventListener('resize', onResize);
			layoutWatch.disconnect();
			opts.canvas.removeEventListener('webglcontextlost', onContextLost);
			document.body.style.cursor = '';
			cue?.classList.remove('is-on');
			cue?.style.removeProperty('transform');
			glyphs.dispose();
			guitar.dispose();
			disposeScene(scene);
			stage.dispose();
		},
	};

	// compile every program up front (in parallel where the driver allows), then start the loop
	try {
		await stage.renderer.compileAsync(scene, camera);
	} catch {
		// compileAsync is an optimisation; the first render compiles anything left
	}
	if (!disposed) loop.start();
	return handle;
}

