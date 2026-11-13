/**
 * The code tier's projects on the page: which one is lit, and the cards that show it. Pure DOM, so
 * the climb can light them with or without the live tower; the tower lights its doorway through
 * `onLight`, and reports a doorway under the pointer through `update`.
 *
 * The lit project (card, and doorway with it): one pointed at (a doorway under the pointer, or a
 * card hovered or focused) wins; otherwise the code tier's stop the scroll is at (see climb.ts).
 * The lit card is also the open one: the list steps (`data-stepping`, ../../home/ProjectList.vue),
 * the others closed to their name and status dot, so a project shows its details before it's
 * opened. Until this runs every card is open, so nothing is hidden that a script didn't take
 * charge of.
 */

export interface ProjectSpec {
	id: string;
	href?: string;
}

export function createProjects(specs: readonly ProjectSpec[], onLight: (i: number) => void = () => {}) {
	const cards = specs.map((d) => document.querySelector<HTMLElement>(`[data-project="${CSS.escape(d.id)}"]`));
	let doorHover = -1;
	let cardHover = -1;
	let stopHot = -1;
	let hot = -1;
	function open(i: number) {
		cards.forEach((c, k) => c?.classList.toggle('is-lit', k === i));
	}
	/**
	 * A project pointed at stays lit a moment after the pointer leaves it (`LINGER` ms), so crossing
	 * the gap between two cards, or two doorways, goes straight from one to the other rather than
	 * through the one at the scroll's stop.
	 */
	const LINGER = 250;
	let pointedAt = -Infinity;
	let linger: number | undefined;
	function showHot() {
		const pointed = doorHover >= 0 ? doorHover : cardHover;
		const now = performance.now();
		if (pointed >= 0) pointedAt = now;
		let i = pointed >= 0 ? pointed : stopHot;
		if (pointed < 0 && hot >= 0 && hot !== stopHot && now - pointedAt < LINGER) {
			i = hot;
			// with or without frames calling in, it lets go once the moment is up
			linger ??= window.setTimeout(() => {
				linger = undefined;
				showHot();
			}, LINGER - (now - pointedAt) + 1);
		}
		if (i === hot) return;
		hot = i;
		onLight(i);
		open(i);
		if (i >= 0 && i === stopHot) revealCard(i);
	}

	const list = cards.find(Boolean)?.closest<HTMLElement>('.projects') ?? null;
	if (list) list.dataset.stepping = '';
	/**
	 * The list keeps the height of its tallest state (whichever card, opened, makes it longest), so
	 * the panel holding it doesn't move as the focus or the pointer moves from card to card.
	 */
	function reserve() {
		if (!list) return;
		list.style.minBlockSize = '';
		list.classList.add('is-measuring');
		let tallest = 0;
		cards.forEach((_, i) => {
			open(i);
			tallest = Math.max(tallest, list.getBoundingClientRect().height);
		});
		open(hot);
		void list.offsetHeight;
		list.classList.remove('is-measuring');
		list.style.minBlockSize = `${Math.ceil(tallest)}px`;
	}
	reserve();
	// the width (and with it the line breaks) changes with the window; the fonts change the metrics.
	// Only a new width re-measures: reserving changes the height, which mustn't set it off again.
	let width = list?.getBoundingClientRect().width ?? 0;
	const watch = new ResizeObserver(() => {
		const w = list?.getBoundingClientRect().width ?? 0;
		if (Math.abs(w - width) < 0.5) return;
		width = w;
		reserve();
	});
	if (list) watch.observe(list);
	document.fonts?.ready.then(reserve).catch(() => {});
	/**
	 * The collapsed mobile sheet's peek at the project in focus (`[data-stop-now]` under the code
	 * tier's lead): a copy of its card, inert and hidden from assistive tech, as the real list
	 * below stays the one to read and use. It starts on the first project.
	 */
	const stopNow = cards.find(Boolean)?.closest('[data-tier-panel]')?.querySelector<HTMLElement>('[data-stop-now]') ?? null;
	let nowShown = -1;
	function showNow(i: number) {
		const card = cards[i];
		if (!stopNow || !card || i === nowShown) return;
		nowShown = i;
		const copy = card.cloneNode(true) as HTMLElement;
		copy.removeAttribute('data-project');
		copy.classList.add('is-lit');
		stopNow.replaceChildren(copy);
		stopNow.classList.remove('is-new');
		void stopNow.offsetWidth; // restart the fade-in
		stopNow.classList.add('is-new');
	}
	showNow(0);
	/**
	 * Scrolls the code panel (not the page) just enough to show the lit card, when it overflows.
	 * Not while it is a collapsed mobile sheet: that one only shows its peek, from its top.
	 */
	function revealCard(i: number) {
		const card = cards[i];
		const panel = card?.closest<HTMLElement>('[data-tier-panel]');
		if (!card || !panel || panel.classList.contains('is-sheet-collapsed')) return;
		// what scrolls: the panel's content on wide screens, the sheet itself on phones
		const box = [card.closest<HTMLElement>('.tier__body'), panel].find((el) => el && el.scrollHeight > el.clientHeight + 1);
		if (!box) return;
		const c = card.getBoundingClientRect();
		const p = box.getBoundingClientRect();
		if (c.top < p.top + 12) box.scrollTop -= p.top + 12 - c.top;
		else if (c.bottom > p.bottom - 12) box.scrollTop += c.bottom - (p.bottom - 12);
	}
	// every card, a project in development too: pointed at, it opens to show what it is
	const cardHandlers = cards.map((card, k) => {
		if (!card) return null;
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

	return {
		/**
		 * Each frame: the doorway under the pointer (-1 for none, or without the live tower) and the
		 * code tier's stop the scroll is at (-1 when the climb isn't holding there).
		 */
		update(door: number, stop: number) {
			doorHover = door;
			stopHot = stop;
			showHot();
			if (stopHot >= 0) showNow(stopHot);
		},
		dispose() {
			window.clearTimeout(linger);
			cardHandlers.forEach((h) => {
				if (!h) return;
				h.card.removeEventListener('pointerenter', h.on);
				h.card.removeEventListener('pointerleave', h.off);
				h.card.removeEventListener('focus', h.on);
				h.card.removeEventListener('blur', h.off);
				h.card.classList.remove('is-lit');
			});
			stopNow?.replaceChildren();
			watch.disconnect();
			if (list) {
				delete list.dataset.stepping;
				list.style.removeProperty('min-block-size');
			}
		},
	};
}

export type Projects = ReturnType<typeof createProjects>;

