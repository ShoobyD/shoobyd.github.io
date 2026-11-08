/**
 * The Tower of Babel scene: builds the world, wires it to the page, and runs the climb.
 * This module (and Three.js with it) is loaded on demand by TowerScene.vue, only once the
 * static page has painted and the browser has passed the WebGL / reduced-motion checks.
 *
 * Activation is the last step: the scene renders its first frames behind the static page,
 * then the root gets `html.webgl`, the layout turns into the climb, and the scroll position is
 * carried over so the visitor stays on the tier they were reading.
 */
import * as THREE from 'three';
import { clamp, createRandom, damp, easeOut, isNarrow, lerp, sstep } from './util';
import { DOOR_PAN, DOOR_STEP, LAST_TIER, PLINTH_TOP, doorAngles, doorPanMax } from './dimensions';
import { createRenderer } from './renderer';
import { createSky } from './sky';
import { createLandscape } from './landscape';
import { createMaterials } from './materials';
import { brickTexture } from './textures';
import { createTower } from './tower';
import { createFigures } from './figures';
import { createSummit } from './summit';
import { createClouds } from './clouds';
import { createCameraRig } from './camera-path';
import { createClimb, type Climb } from './climb';
import { createSheet, type Sheet } from './sheet';
import { createLoop } from './loop';
import { disposeScene } from './dispose';
import { createDoors, type DoorSpec } from './tiers/doors';
import { createArmillary } from './tiers/armillary';
import { createGlyphs } from './tiers/glyphs';
import { STRING_COUNT, createStrings } from './tiers/strings';
import { createGuitarSound } from './tiers/guitar-sound';
import { createPortrait, type PortraitSpec } from './tiers/portrait';
import { TOWER_CLASS, progressAt, scrollFor, sectionTops } from '../mode';

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
	/** Called if the GPU drops the context; the caller tears the scene down to the static page. */
	onLost?: () => void;
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
		// nothing is on the page yet; free what was built and let the caller keep the static page
		disposeScene(scene);
		stage.dispose();
		throw err;
	}
	const { brick, sky, landscape, built, doors, figures, summit, armillary, glyphs, strings, clouds } = world;
	const rig = createCameraRig(camera);

	// ---------- page wiring ----------
	const cards = opts.doors.map((d) => document.querySelector<HTMLElement>(`[data-project="${CSS.escape(d.id)}"]`));
	/**
	 * The lit project (door and card together): one pointed at (a doorway under the pointer, or a
	 * card hovered or focused) wins; otherwise the code tier's stop the scroll is at (see climb.ts).
	 */
	let cardHover = -1;
	let stopHot = -1;
	let hot = -1;
	function showHot() {
		const i = doorHover >= 0 ? doorHover : cardHover >= 0 ? cardHover : stopHot;
		if (i === hot) return;
		hot = i;
		doors.setHot(i);
		cards.forEach((c, k) => c?.classList.toggle('is-lit', k === i));
		if (i >= 0 && i === stopHot) revealCard(i);
	}
	/** Scrolls the code panel (not the page) just enough to show the lit card, when it overflows. */
	function revealCard(i: number) {
		const card = cards[i];
		const panel = card?.closest<HTMLElement>('[data-tier-panel]');
		if (!card || !panel || panel.scrollHeight <= panel.clientHeight) return;
		const c = card.getBoundingClientRect();
		const p = panel.getBoundingClientRect();
		if (c.top < p.top + 12) panel.scrollTop -= p.top + 12 - c.top;
		else if (c.bottom > p.bottom - 12) panel.scrollTop += c.bottom - (p.bottom - 12);
	}
	const cardHandlers = cards.map((card, k) => {
		if (!card || !opts.doors[k].href) return null;
		const on = () => {
			cardHover = k;
			showHot();
		};
		const off = () => {
			if (cardHover === k) cardHover = -1;
			showHot();
		};
		card.addEventListener('pointerenter', on);
		card.addEventListener('pointerleave', off);
		card.addEventListener('focus', on);
		card.addEventListener('blur', off);
		return { card, on, off };
	});

	const pointer = { x: 0, y: 0, sx: 0, sy: 0, ndc: new THREE.Vector2(), lastX: 0, lastY: 0, moved: false, inUi: false };
	/** The strings' notes; silent until the visitor's first click, tap or key press. */
	const guitar = createGuitarSound();
	let nearest = 0;
	let doorHover = -1;
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
	// clicking a doorway opens its project; the pick happens at click time so taps work too
	function onClick(e: MouseEvent) {
		if (nearest !== 1 || pointerInUi(e.target) || director) return;
		const ndc = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
		const i = doors.pick(ndc, camera);
		const href = i >= 0 ? opts.doors[i].href : undefined;
		if (href) window.location.href = href;
	}
	window.addEventListener('pointermove', onPointerMove, { passive: true });
	window.addEventListener('pointerdown', onPointerDown, { passive: true });
	window.addEventListener('click', onClick);

	// ---------- activation: carry the reading position over into the climb layout ----------
	// Until the first frames are on screen the static page stays as it is, and the camera reads
	// the static layout's progress; then the root class flips the layout and the scroll position
	// is mapped onto the tall climb spans so the visitor stays on the tier they were reading.
	let climb: Climb | null = null;
	// narrow screens: the panels are bottom sheets (see ./sheet.ts)
	let sheet: Sheet | null = null;
	let lift: number | null = null;
	// A link straight to a tier (`/#tier-summit`, where /contact/ redirects) parks the climb on it
	// exactly: the static page can't always scroll the last tier's top up to the viewport, so its
	// scroll position alone would land just below it. It holds while the page is still within a
	// tier of the link (layout settling and scroll anchoring move it a little); a visitor who has
	// scrolled further away keeps their own place.
	const linkedTier = (() => {
		const id = /^#tier-([\w-]+)$/.exec(location.hash)?.[1];
		const i = id ? opts.tiers.indexOf(id) : -1;
		return i >= 0 ? i : null;
	})();
	const readingNow = () => {
		const at = progressAt(sectionTops(sectionEls), window.scrollY);
		return linkedTier !== null && Math.abs(at - linkedTier) < 1 ? linkedTier : at;
	};
	/**
	 * The tier the climb stays parked on while the layout settles after arriving by such a link
	 * (panels docking, fonts, the mode switch all re-measure the sections); the visitor's first
	 * wheel, touch, key or click lets go of it.
	 */
	let pinned: number | null = null;
	const PIN_RELEASE = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
	function unpin() {
		pinned = null;
		PIN_RELEASE.forEach((type) => window.removeEventListener(type, unpin, true));
	}
	function holdPin() {
		if (pinned !== null) climb?.goTier(pinned);
	}
	let smooth = readingNow();
	const intro = { from: 0, play: smooth < 0.05 };
	let enter = 0;

	function activate(now: number) {
		const reading = readingNow();
		root.classList.add(TOWER_CLASS);
		climb = createClimb(sectionEls, panelEls);
		sheet = createSheet(panelEls, Math.round(reading));
		if (reading > 0) climb.goTo(reading);
		if (linkedTier !== null && reading === linkedTier) {
			pinned = linkedTier;
			PIN_RELEASE.forEach((type) => window.addEventListener(type, unpin, { capture: true, passive: true }));
		}
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
		holdPin();
	}
	window.addEventListener('resize', onResize);
	// section heights change with fonts, panel content and the mode switch itself
	const layoutWatch = new ResizeObserver(() => {
		climb?.measure();
		holdPin();
	});
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
	let lastTier = -1;
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

	const loop = createLoop((dt, now) => {
		time += dt;
		const target = climb ? climb.progress : progressAt(sectionTops(sectionEls), window.scrollY);
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
		summit.update(time);
		armillary.update(time);
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
		// on the code tier the scroll steps from project to project, lighting each in turn
		const stop = climb?.stop;
		stopHot = stop && stop.tier === 1 && !director ? Math.round(stop.at) : -1;
		showHot();
		doors.update(dt, time);

		if (climb) {
			enter = Math.min(1, enter + dt / 0.7);
			// a director's shot fades the panels out with it (game mode hides them)
			climb.updatePanels(smooth, easeOut(enter) * (1 - blend));
			sheet?.update(nearest, Math.round(climb.progress));
			if (nearest !== lastTier) {
				lastTier = nearest;
				window.dispatchEvent(new CustomEvent('tower:tier', { detail: opts.tiers[nearest] }));
			}
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
			if (climb) {
				// hand the reading position back to the static layout
				const progress = climb.progress;
				climb.dispose();
				sheet?.dispose();
				root.classList.remove(TOWER_CLASS);
				if (progress > 0) window.scrollTo({ top: scrollFor(sectionTops(sectionEls), progress), behavior: 'instant' });
			}
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('click', onClick);
			window.removeEventListener('resize', onResize);
			layoutWatch.disconnect();
			unpin();
			opts.canvas.removeEventListener('webglcontextlost', onContextLost);
			cardHandlers.forEach((h) => {
				if (!h) return;
				h.card.removeEventListener('pointerenter', h.on);
				h.card.removeEventListener('pointerleave', h.off);
				h.card.removeEventListener('focus', h.on);
				h.card.removeEventListener('blur', h.off);
				h.card.classList.remove('is-lit');
			});
			document.body.style.cursor = '';
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

