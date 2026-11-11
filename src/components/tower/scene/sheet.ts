/**
 * Narrow screens: each fixed tier panel is a bottom sheet. Collapsed, it shows only its title and
 * the start of what follows, and the tower has the screen; its handle (the keystone, a real
 * button with `aria-expanded`) or a tap on the sheet opens it to nearly the full height, and a
 * finger can drag it open or closed.
 *
 * - The base tier starts open, so the introduction is read on arrival; every other tier starts
 *   collapsed, and moving to another tier collapses them all again.
 * - Esc, or a tap on the tower outside it, collapses an open sheet; tabbing into a collapsed one
 *   opens it, so focus is never hidden.
 * - Game mode collapses them (it hides the panels anyway).
 * - While one is open the root carries `sd-sheet-open` (the altitude gauge dims under it).
 * - A sheet whose content fits carries `is-sheet-fits`: with nothing to scroll inside it, a swipe
 *   on it climbs the tower (TierSection.vue makes it no scroll box); a longer one keeps its scroll
 *   to itself, so reading to its end doesn't climb on and collapse it.
 *
 * The CSS (TierSection.vue) does the moving, with the `translate` property, so it composes with
 * the climb's own `transform` on the panel; this only keeps the state and measures each sheet's
 * peek (`--sheet-peek`, down to just below its title) and the room under the header (`--sheet-top`).
 */
import { isNarrow } from './util';

const COLLAPSED = 'is-sheet-collapsed';
const OPEN_CLASS = 'sd-sheet-open';
const FITS = 'is-sheet-fits';
const GAME_CLASS = 'tower-game';
/** How much of the first lines below the title the collapsed sheet shows, in px. */
const PEEK_BELOW_TITLE = 56;
/** With a peek slot below the title, how much shows below the slot (its margin, then the fade). */
const PEEK_BELOW_SLOT = 44;

export function createSheet(panels: HTMLElement[], startTier: number) {
	const root = document.documentElement;
	const header = document.querySelector<HTMLElement>('.sd-header');
	const footer = document.querySelector<HTMLElement>('.sd-footer');
	let docked = -1;
	/**
	 * At the end of the page the site footer scrolls up from under the sheets: they rest on it,
	 * raised by as much of it as is in view (`--sheet-bottom`), so its credit is never under one.
	 */
	function dock() {
		const over = footer ? Math.max(0, Math.round(window.innerHeight - footer.getBoundingClientRect().top)) : 0;
		if (over === docked) return;
		docked = over;
		root.style.setProperty('--sheet-bottom', `${over}px`);
	}
	const handles = panels.map((p) => p.querySelector<HTMLButtonElement>('[data-sheet-handle]'));
	const titles = panels.map((p) => p.querySelector<HTMLElement>('.tier__title'));
	const nows = panels.map((p) => p.querySelector<HTMLElement>('[data-stop-now]'));
	const nowHeights = panels.map(() => 0);
	let tier = startTier;
	let game = false;
	/** the bottom of the fixed header, measured with the sheets */
	let headerBottom = 0;

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
			if (!t) return;
			// a peek slot below the title (the projects tier's project in focus, under its title) shows
			// only while collapsed, and the peek reaches down past it: its height is taken then, and
			// kept for the next collapse while open
			const now = nows[i];
			if (now && now.offsetParent) nowHeights[i] = now.offsetTop + now.offsetHeight - (t.offsetTop + t.offsetHeight);
			const below = nowHeights[i] ? nowHeights[i] + PEEK_BELOW_SLOT : PEEK_BELOW_TITLE;
			p.style.setProperty('--sheet-peek', `${t.offsetTop + t.offsetHeight + below}px`);
			p.classList.toggle(FITS, p.scrollHeight <= p.clientHeight + 1);
		});
		headerBottom = header ? Math.round(header.getBoundingClientRect().bottom) : 0;
		root.style.setProperty('--sheet-top', `${headerBottom + 6}px`);
		docked = -1;
		dock();
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
	// a collapsed sheet shows its peek from the top: whatever scrolls its (hidden) overflow, it
	// goes back (overflow: hidden still lets scripts and focus scroll a box)
	const onScroll = panels.map((p, i) => () => {
		if (isCollapsed(i) && p.scrollTop !== 0) p.scrollTop = 0;
	});
	const onFocus = panels.map((_, i) => (e: FocusEvent) => {
		if (isNarrow() && isCollapsed(i) && e.target !== handles[i]) set(i, true);
	});
	/**
	 * A tap (or click) outside an open sheet, on the tower, collapses it, and only that: the tap
	 * doesn't also open a doorway or start the game, so closing the sheet never sets anything off
	 * by accident. The page's own controls (header, gauge, links, buttons, dialogs) keep working.
	 * This listens on the window's capture phase, ahead of the scene's own click handling.
	 */
	function onOutside(e: MouseEvent) {
		if (!isNarrow()) return;
		const t = e.target as Element | null;
		if (t?.closest?.('[data-tier-panel], .sd-header, [data-tower-chrome], a, button, input, dialog')) return;
		const open = panels.filter((_, i) => !isCollapsed(i));
		if (!open.length) return;
		e.preventDefault();
		e.stopImmediatePropagation();
		panels.forEach((_, i) => {
			if (!isCollapsed(i)) set(i, false);
		});
	}

	function onKey(e: KeyboardEvent) {
		if (e.key !== 'Escape' || e.defaultPrevented || !isNarrow()) return;
		if ((e.target as Element | null)?.closest?.('dialog[open]')) return; // a dialog closes itself
		const i = panels.findIndex((p, j) => !isCollapsed(j) && p.classList.contains('is-on'));
		if (i < 0) return;
		set(i, false);
		handles[i]?.focus();
	}

	// ---------- dragging ----------
	// A finger moves the sheet with it, then lets it settle open or collapsed by where it was
	// left and how fast it was moving. What starts a drag:
	// - on a collapsed sheet, a swipe up (a swipe down there still climbs the tower);
	// - on an open one, any swipe on its handle or title band; on its content, a swipe down when
	//   that is a long one already scrolled to its top. Otherwise the content scrolls as usual,
	//   or, all of it in view (`is-sheet-fits`), the swipe climbs the tower, up or down.
	let drag: {
		i: number;
		y0: number;
		/** where the sheet was when the drag started: 0 open, `range` collapsed */
		from: number;
		range: number;
		/** null until the first move decides whether this is a drag at all */
		on: boolean | null;
		band: boolean;
		offset: number;
		samples: { y: number; t: number }[];
	} | null = null;
	/** a click that lands right after a drag (on what was under the finger) is swallowed */
	let swallowUntil = 0;
	const FLICK = 0.45; // px/ms

	const onTouchStart = panels.map((p, i) => (e: TouchEvent) => {
		if (!isNarrow() || e.touches.length !== 1 || !p.classList.contains('is-on')) return;
		const y = e.touches[0].clientY;
		const title = titles[i];
		const bandEnd = title ? p.getBoundingClientRect().top + title.offsetTop + title.offsetHeight : 0;
		const range = Math.max(0, p.offsetHeight - peekOf(i));
		drag = {
			i,
			y0: y,
			from: isCollapsed(i) ? range : 0,
			range,
			on: null,
			band: y <= bandEnd,
			offset: 0,
			samples: [{ y, t: e.timeStamp }],
		};
	});

	function onTouchMove(e: TouchEvent) {
		if (!drag || e.touches.length !== 1) return;
		const p = panels[drag.i];
		const y = e.touches[0].clientY;
		const dy = y - drag.y0;
		if (drag.on === null) {
			if (Math.abs(dy) < 4) return;
			const collapsed = drag.from > 0;
			drag.on = collapsed ? dy < 0 : drag.band || (dy > 0 && p.scrollTop <= 0 && !p.classList.contains(FITS));
			if (!drag.on) {
				drag = null;
				return;
			}
			p.classList.add('is-sheet-dragging');
		}
		if (!drag.on) return;
		e.preventDefault();
		drag.offset = Math.min(drag.range, Math.max(0, drag.from + dy));
		p.style.translate = `0 ${drag.offset}px`;
		drag.samples.push({ y, t: e.timeStamp });
		if (drag.samples.length > 6) drag.samples.shift();
	}

	function onTouchEnd(e: TouchEvent) {
		if (!drag) return;
		const d = drag;
		drag = null;
		if (!d.on) return;
		const p = panels[d.i];
		// the speed over the last moments only: a finger that stopped before lifting isn't a flick
		const recent = d.samples.filter((s) => s.t >= e.timeStamp - 120);
		const first = recent[0];
		const last = recent[recent.length - 1];
		const v = recent.length > 1 && last.t > first.t ? (last.y - first.y) / (last.t - first.t) : 0;
		const open = v < -FLICK ? true : v > FLICK ? false : d.offset < d.range / 2;
		// handing back to the class lets the transition carry the sheet on from where the finger left it
		p.classList.remove('is-sheet-dragging');
		p.style.removeProperty('translate');
		set(d.i, open);
		swallowUntil = e.timeStamp + 400;
	}

	function onClickCapture(e: MouseEvent) {
		if (e.timeStamp > swallowUntil) return;
		swallowUntil = 0;
		e.preventDefault();
		e.stopImmediatePropagation();
	}

	const peekOf = (i: number) => parseFloat(panels[i].style.getPropertyValue('--sheet-peek')) || 150;

	const watch = new ResizeObserver(measure);
	panels.forEach((p, i) => {
		set(i, i === 0 && startTier === 0);
		watch.observe(p);
		// a peek slot's height changes with what it holds (and its width with the window)
		if (nows[i]) watch.observe(nows[i]);
		handles[i]?.addEventListener('click', onHandle[i]);
		p.addEventListener('click', onClickCapture, true);
		p.addEventListener('click', onTap[i], true);
		p.addEventListener('focusin', onFocus[i]);
		p.addEventListener('touchstart', onTouchStart[i], { passive: true });
		p.addEventListener('scroll', onScroll[i], { passive: true });
	});
	window.addEventListener('touchmove', onTouchMove, { passive: false });
	window.addEventListener('touchend', onTouchEnd);
	window.addEventListener('touchcancel', onTouchEnd);
	window.addEventListener('keydown', onKey);
	window.addEventListener('click', onOutside, true);
	window.addEventListener('resize', measure);
	window.addEventListener('scroll', dock, { passive: true });
	measure();

	return {
		/**
		 * How far (px) to lift the tower so it sits in the middle of the room between the header and
		 * the top of tier `i`'s sheet, wherever that is right now (open, collapsed, mid-drag or
		 * mid-transition).
		 */
		lift(i: number) {
			const p = panels[i];
			if (!p) return 0;
			// the box includes the sheet's translate (and the climb's small drift)
			const sheetTop = Math.min(window.innerHeight, p.getBoundingClientRect().top);
			return window.innerHeight / 2 - (headerBottom + sheetTop) / 2;
		},
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
			window.removeEventListener('click', onOutside, true);
			window.removeEventListener('resize', measure);
			window.removeEventListener('scroll', dock);
			window.removeEventListener('touchmove', onTouchMove);
			window.removeEventListener('touchend', onTouchEnd);
			window.removeEventListener('touchcancel', onTouchEnd);
			panels.forEach((p, i) => {
				handles[i]?.removeEventListener('click', onHandle[i]);
				p.removeEventListener('click', onClickCapture, true);
				p.removeEventListener('touchstart', onTouchStart[i]);
				p.removeEventListener('scroll', onScroll[i]);
				p.classList.remove('is-sheet-dragging');
				p.style.removeProperty('translate');
				p.removeEventListener('click', onTap[i], true);
				p.removeEventListener('focusin', onFocus[i]);
				p.classList.remove(COLLAPSED, FITS);
				p.style.removeProperty('--sheet-peek');
				handles[i]?.setAttribute('aria-expanded', 'true');
			});
			root.classList.remove(OPEN_CLASS);
			root.style.removeProperty('--sheet-top');
			root.style.removeProperty('--sheet-bottom');
		},
	};
}

export type Sheet = ReturnType<typeof createSheet>;

