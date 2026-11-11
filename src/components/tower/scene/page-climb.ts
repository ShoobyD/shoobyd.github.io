/**
 * The page's side of the climb, whatever is behind it (the live tower, or the still picture):
 * the scroll progress and keys (./climb.ts), the bottom sheets on narrow screens (./sheet.ts), the
 * code tier's lit project (./projects.ts) and the experience tier's path (./path.ts). Pure DOM;
 * whoever runs the frames calls `update` with the progress it shows (the camera's eased progress,
 * for the live tower) and `light` with the doorway under the pointer, if it has one.
 */
import { createClimb } from './climb';
import { createSheet } from './sheet';
import { createProjects, type ProjectSpec } from './projects';
import { createPath } from './path';

export interface PageClimbOptions {
	sections: HTMLElement[];
	panels: HTMLElement[];
	/** the tier ids, in order (the `tower:tier` event carries the one reached) */
	tiers: readonly string[];
	/** the code tier's projects, in the order of its stops */
	projects: readonly ProjectSpec[];
	/** the tier the visitor arrives on (its sheet starts open if it is the base) */
	startTier: number;
	/** lights a project's doorway (the live tower), or turns them all off with -1 */
	onLight?: (i: number) => void;
}

/** The code tier, whose stops step from project to project. */
const CODE_TIER = 1;

export function createPageClimb(o: PageClimbOptions) {
	const climb = createClimb(o.sections, o.panels);
	const sheet = createSheet(o.panels, o.startTier);
	const projects = createProjects(o.projects, o.onLight);
	// the experience tier's path, found by what its panel holds
	const pathTier = o.panels.findIndex((p) => p.querySelector('.path'));
	const pathList = pathTier >= 0 ? o.panels[pathTier].querySelector<HTMLElement>('.path') : null;
	const path = pathList ? createPath(pathList) : null;
	const pathStops = pathList ? pathList.querySelectorAll(':scope > .path__stage').length : 0;
	let lastTier = -1;
	/** the path's stop: 0 (the degree) below and on its first stop .. the last (today) above */
	let pathLevel = 0;
	// a climb is running the panels (TowerLoaderBoot's fallback looks for it); one that came late,
	// after the fallback gave up on it, takes the page back from its message
	const root = document.documentElement;
	root.dataset.climb = 'live';
	root.classList.remove('sd-js-failed');

	return {
		climb,
		sheet,
		/**
		 * The path's stop the climb is at, 0 (the degree; also below its tier) .. its last (today), as
		 * the panel shows it; the tower builds with it.
		 */
		get pathLevel() {
			return pathLevel;
		},
		/**
		 * The lit project: `door` is the doorway under the pointer (-1 for none); while `paused` (a
		 * game takes the camera) the code tier's stops light nothing.
		 */
		light(door: number, paused = false) {
			// on the code tier the scroll steps from project to project, lighting each in turn
			const stop = climb.stop;
			projects.update(door, stop && stop.tier === CODE_TIER && !paused ? Math.round(stop.at) : -1);
		},
		/**
		 * Each frame: the panels and sheets at `progress` (fractional tier), faded in by `enter`
		 * (0..1), drifting by `drift` (0 with reduced motion: they only fade).
		 */
		update(progress: number, enter: number, drift = 1) {
			const nearest = Math.round(progress);
			climb.updatePanels(progress, enter, drift);
			sheet.update(nearest, Math.round(climb.progress));
			if (path) {
				// the stop the scroll is at on the path's tier; below it the degree, above it today
				const stop = climb.stop;
				pathLevel = stop && stop.tier === pathTier ? Math.round(stop.at) : climb.progress < pathTier ? 0 : pathStops - 1;
				path.update(pathLevel);
			}
			if (nearest !== lastTier) {
				lastTier = nearest;
				window.dispatchEvent(new CustomEvent('tower:tier', { detail: o.tiers[nearest] }));
			}
		},
		dispose() {
			climb.dispose();
			sheet.dispose();
			projects.dispose();
			path?.dispose();
			delete root.dataset.climb;
		},
	};
}

export type PageClimb = ReturnType<typeof createPageClimb>;

