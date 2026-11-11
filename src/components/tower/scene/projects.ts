/**
 * The code tier's projects on the page: which one is lit, and the cards that show it. Pure DOM, so
 * the climb can light them with or without the live tower; the tower lights its doorway through
 * `onLight`, and reports a doorway under the pointer through `update`.
 *
 * The lit project (card, and doorway with it): one pointed at (a doorway under the pointer, or a
 * card hovered or focused) wins; otherwise the code tier's stop the scroll is at (see climb.ts).
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
	function showHot() {
		const i = doorHover >= 0 ? doorHover : cardHover >= 0 ? cardHover : stopHot;
		if (i === hot) return;
		hot = i;
		onLight(i);
		cards.forEach((c, k) => c?.classList.toggle('is-lit', k === i));
		if (i >= 0 && i === stopHot) revealCard(i);
	}
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
	const cardHandlers = cards.map((card, k) => {
		if (!card || !specs[k].href) return null;
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
			cardHandlers.forEach((h) => {
				if (!h) return;
				h.card.removeEventListener('pointerenter', h.on);
				h.card.removeEventListener('pointerleave', h.off);
				h.card.removeEventListener('focus', h.on);
				h.card.removeEventListener('blur', h.off);
				h.card.classList.remove('is-lit');
			});
			stopNow?.replaceChildren();
		},
	};
}

export type Projects = ReturnType<typeof createProjects>;

