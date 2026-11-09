/**
 * The climb without the live tower (reduced motion, Save-Data, no WebGL 2, `?no3d`, or the scene
 * gave up): the same page as the 3D climb, with fixed panels (bottom sheets on phones), keys and
 * stops (./scene/page-climb.ts), over the still picture of the tower (home/StaticTower.astro,
 * which follows the same scroll progress). This only runs its frames: the panels follow the
 * scroll, eased, and with reduced motion they only fade, without drifting.
 *
 * The layout may already be the climb when it starts (TowerLoaderBoot sets `html.sd-climb` before
 * the first paint for visitors who won't get the 3D); otherwise, as when the scene drops out, it
 * switches the layout itself and carries the reading position over, and `dispose(true)` hands it
 * back the same way (to the scene taking over, which then switches it again).
 */
import { CLIMB_CLASS, isClimbing, progressAt, scrollFor, sectionHolds, sectionTops } from './mode';
import { createPageClimb, type PageClimb } from './scene/page-climb';
import type { ProjectSpec } from './scene/projects';
import { damp, easeOut } from './scene/util';

export interface StillClimbOptions {
	/** Tier ids in climbing order; each has a section `#tier-<id>` holding a `[data-tier-panel]`. */
	tiers: readonly string[];
	/** The code tier's projects, in card order. */
	projects: readonly ProjectSpec[];
}

export function createStillClimb(o: StillClimbOptions) {
	const root = document.documentElement;
	const sections = o.tiers.map((id) => document.getElementById(`tier-${id}`));
	if (sections.some((s) => !s)) return null;
	const sectionEls = sections as HTMLElement[];
	const panels = sectionEls.map((s) => s.querySelector<HTMLElement>('[data-tier-panel]'));
	if (panels.some((p) => !p)) return null;

	// where the visitor is reading, in whichever layout the page has now
	const reading = progressAt(sectionTops(sectionEls), window.scrollY, sectionHolds(sectionEls));
	const switching = !isClimbing();
	root.classList.add(CLIMB_CLASS);
	const page: PageClimb = createPageClimb({
		sections: sectionEls,
		panels: panels as HTMLElement[],
		tiers: o.tiers,
		projects: o.projects,
		startTier: Math.round(reading),
	});
	if (switching && reading > 0) page.climb.goTo(reading);

	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
	let smooth = page.climb.progress;
	let enter = 0;
	let frame = 0;
	let last = 0;
	function draw(time: number) {
		frame = 0;
		const dt = last ? Math.min(0.1, (time - last) / 1000) : 0;
		last = time;
		const target = page.climb.progress;
		smooth = reduced.matches ? target : smooth + (target - smooth) * damp(12, dt);
		if (Math.abs(target - smooth) < 1e-4) smooth = target;
		enter = Math.min(1, enter + dt / 0.7);
		page.light(-1);
		page.update(smooth, easeOut(enter), reduced.matches ? 0 : 1);
		// keep going while the panels are still on their way
		if (smooth !== target || enter < 1) schedule();
		else last = 0;
	}
	function schedule() {
		if (!frame) frame = requestAnimationFrame(draw);
	}
	function remeasure() {
		page.climb.measure();
		schedule();
	}
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', remeasure);
	// section heights change with fonts, panel content and the layout switch itself
	const layoutWatch = new ResizeObserver(remeasure);
	layoutWatch.observe(document.body);
	schedule();

	return {
		/**
		 * Stops it. `handBack` returns the page to the static layout with the reading position
		 * carried over, for the live tower taking over (its activation switches it back to the
		 * climb the same way).
		 */
		dispose(handBack = false) {
			cancelAnimationFrame(frame);
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', remeasure);
			layoutWatch.disconnect();
			const progress = page.climb.progress;
			page.dispose();
			if (!handBack) return;
			root.classList.remove(CLIMB_CLASS);
			if (progress > 0) window.scrollTo({ top: scrollFor(sectionTops(sectionEls), progress), behavior: 'instant' });
		},
	};
}

export type StillClimb = NonNullable<ReturnType<typeof createStillClimb>>;

