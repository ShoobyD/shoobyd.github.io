/**
 * The 3D mode switch, shared by the tower island and the page components without pulling in
 * Three.js. While the scene is active the root element carries `html.webgl`; the page CSS uses it
 * to turn tiers into tall scroll spans with fixed, fading panels over the canvas.
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
 * Where each tier starts in document coordinates. In both modes a tier is "reached" when its
 * section's top meets the top of the viewport, so the camera, the panels and the altitude gauge
 * all read the same progress.
 */
export function sectionTops(sections: HTMLElement[]) {
	const y = window.scrollY;
	return sections.map((el) => el.getBoundingClientRect().top + y);
}

/** Fractional tier progress (0 .. sections - 1) for a scroll position. */
export function progressAt(tops: number[], scrollY: number) {
	const last = tops.length - 1;
	if (scrollY <= tops[0]) return 0;
	if (scrollY >= tops[last]) return last;
	let i = 0;
	while (i < last - 1 && scrollY >= tops[i + 1]) i++;
	return i + (scrollY - tops[i]) / (tops[i + 1] - tops[i]);
}

/** The scroll position for a fractional tier progress (inverse of `progressAt`). */
export function scrollFor(tops: number[], progress: number) {
	const last = tops.length - 1;
	const i = Math.min(Math.floor(progress), last - 1);
	const t = Math.min(1, progress - i);
	return tops[i] + (tops[i + 1] - tops[i]) * t;
}

