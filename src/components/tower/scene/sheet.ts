/**
 * Narrow screens: each fixed tier panel is a bottom sheet. Collapsed, it shows only its title and
 * the start of what follows, and the tower has the screen; its handle (the keystone, a real
 * button with `aria-expanded`) or a tap on the sheet opens it to nearly the full height.
 *
 * - The base tier starts open, so the introduction is read on arrival; every other tier starts
 *   collapsed, and moving to another tier collapses them all again.
 * - Esc collapses an open sheet; tabbing into a collapsed one opens it, so focus is never hidden.
 * - Game mode collapses them (it hides the panels anyway).
 * - While one is open the root carries `sd-sheet-open` (the altitude gauge dims under it).
 *
 * The CSS (TierSection.vue) does the moving, with the `translate` property, so it composes with
 * the climb's own `transform` on the panel; this only keeps the state and measures each sheet's
 * peek (`--sheet-peek`, down to just below its title) and the room under the header (`--sheet-top`).
 */
import { isNarrow } from './util';

const COLLAPSED = 'is-sheet-collapsed';
const OPEN_CLASS = 'sd-sheet-open';
const GAME_CLASS = 'tower-game';
/** How much of the first lines below the title the collapsed sheet shows, in px. */
const PEEK_BELOW_TITLE = 56;

export function createSheet(panels: HTMLElement[], startTier: number) {
	const root = document.documentElement;
	const header = document.querySelector<HTMLElement>('.sd-header');
	const handles = panels.map((p) => p.querySelector<HTMLButtonElement>('[data-sheet-handle]'));
	const titles = panels.map((p) => p.querySelector<HTMLElement>('.tier__title'));
	let tier = startTier;
	let game = false;

	function set(i: number, open: boolean) {
		const p = panels[i];
		p.classList.toggle(COLLAPSED, !open);
		handles[i]?.setAttribute('aria-expanded', String(open));
		if (!open) p.scrollTop = 0;
		syncRoot();
	}

	function syncRoot() {
		root.classList.toggle(OPEN_CLASS, isNarrow() && panels.some((p) => !p.classList.contains(COLLAPSED)));
	}

	/**
	 * Collapses every sheet, except the one of the tier the climb is heading to (`keep`) while it
	 * holds keyboard focus: tabbing into a tier's panel opens it and moves the climb there, past
	 * the tiers in between.
	 */
	function collapseAll(keep: number) {
		const focused = document.activeElement;
		const keyboard = !!focused?.matches(':focus-visible');
		panels.forEach((p, i) => {
			if (!(i === keep && keyboard && p.contains(focused))) set(i, false);
		});
	}

	function measure() {
		panels.forEach((p, i) => {
			const t = titles[i];
			if (t) p.style.setProperty('--sheet-peek', `${t.offsetTop + t.offsetHeight + PEEK_BELOW_TITLE}px`);
		});
		if (header) root.style.setProperty('--sheet-top', `${Math.round(header.getBoundingClientRect().bottom + 6)}px`);
		syncRoot();
	}

	const isCollapsed = (i: number) => panels[i].classList.contains(COLLAPSED);

	const onHandle = handles.map((_, i) => (e: Event) => {
		e.stopPropagation();
		set(i, isCollapsed(i));
	});
	// a tap anywhere on a collapsed sheet opens it (rather than following a link half out of sight)
	const onTap = panels.map((_, i) => (e: MouseEvent) => {
		if (!isNarrow() || !isCollapsed(i)) return;
		e.preventDefault();
		e.stopPropagation();
		set(i, true);
	});
	const onFocus = panels.map((_, i) => (e: FocusEvent) => {
		if (isNarrow() && isCollapsed(i) && e.target !== handles[i]) set(i, true);
	});
	function onKey(e: KeyboardEvent) {
		if (e.key !== 'Escape' || e.defaultPrevented || !isNarrow()) return;
		if ((e.target as Element | null)?.closest?.('dialog[open]')) return; // a dialog closes itself
		const i = panels.findIndex((p, j) => !isCollapsed(j) && p.classList.contains('is-on'));
		if (i < 0) return;
		set(i, false);
		handles[i]?.focus();
	}

	const watch = new ResizeObserver(measure);
	panels.forEach((p, i) => {
		set(i, i === 0 && startTier === 0);
		watch.observe(p);
		handles[i]?.addEventListener('click', onHandle[i]);
		p.addEventListener('click', onTap[i], true);
		p.addEventListener('focusin', onFocus[i]);
	});
	window.addEventListener('keydown', onKey);
	window.addEventListener('resize', measure);
	measure();

	return {
		/**
		 * Called every frame with the tier in view and the one the climb is heading to: a new tier
		 * in view (or game mode) collapses the sheets.
		 */
		update(nearest: number, heading: number) {
			const playing = root.classList.contains(GAME_CLASS);
			if (nearest !== tier || (playing && !game)) collapseAll(playing ? -1 : heading);
			tier = nearest;
			game = playing;
		},
		dispose() {
			watch.disconnect();
			window.removeEventListener('keydown', onKey);
			window.removeEventListener('resize', measure);
			panels.forEach((p, i) => {
				handles[i]?.removeEventListener('click', onHandle[i]);
				p.removeEventListener('click', onTap[i], true);
				p.removeEventListener('focusin', onFocus[i]);
				p.classList.remove(COLLAPSED);
				p.style.removeProperty('--sheet-peek');
				handles[i]?.setAttribute('aria-expanded', 'true');
			});
			root.classList.remove(OPEN_CLASS);
			root.style.removeProperty('--sheet-top');
		},
	};
}

export type Sheet = ReturnType<typeof createSheet>;

