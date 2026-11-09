/**
 * The climb's shared reading of the page, for the tower island and the page components, without
 * pulling in Three.js. The page is always laid out as the climb: tiers are tall scroll spans with
 * fixed, fading panels (bottom sheets on phones) over the tower. While the live 3D tower is up
 * behind it, the root element carries `html.webgl` (its canvas, game mode, the hints that point
 * at it); otherwise the still picture stands there (home/StaticTower.astro).
 */
export const TOWER_CLASS = 'webgl';

export const isTowerActive = () => document.documentElement.classList.contains(TOWER_CLASS);

/**
 * Set on the root by TowerLoaderBoot (inline, before first paint) while the full-screen loader is
 * up. The inline script cannot import this, so keep the literal there in sync.
 */
export const LOADING_CLASS = 'sd-tower-loading';

/** Lifts the loader: called when the scene is live, and on every path where it gives up. */
export const endLoading = () => document.documentElement.classList.remove(LOADING_CLASS);

/**
 * Where each tier starts in document coordinates. A tier is "reached" when its section's top meets
 * the top of the viewport, so the camera (or the still picture), the panels and the altitude gauge
 * all read the same progress.
 */
export function sectionTops(sections: HTMLElement[]) {
	const y = window.scrollY;
	return sections.map((el) => el.getBoundingClientRect().top + y);
}

/**
 * In the climb a tier marked `data-stops` holds the climb for a while: its section is taller
 * than the usual 1.5 viewports (TierSection.vue), and over that extra length, from the section's
 * top, the progress stays on the tier while the scroll steps through its stops. This is each
 * section's hold in px (0 for the others).
 */
export function sectionHolds(sections: HTMLElement[]) {
	return sections.map((el) =>
		el.dataset.stops ? Math.max(0, el.getBoundingClientRect().height - 1.5 * window.innerHeight) : 0,
	);
}

/**
 * Fractional tier progress (0 .. sections - 1) for a scroll position. Within a tier's hold
 * (`holds`, see `sectionHolds`) it stays on that tier; past it, it moves on to the next.
 */
export function progressAt(tops: number[], scrollY: number, holds: number[] = []) {
	const last = tops.length - 1;
	if (scrollY <= tops[0]) return 0;
	if (scrollY >= tops[last]) return last;
	let i = 0;
	while (i < last - 1 && scrollY >= tops[i + 1]) i++;
	const start = tops[i] + (holds[i] ?? 0);
	if (scrollY <= start) return i;
	return i + (scrollY - start) / (tops[i + 1] - start);
}

