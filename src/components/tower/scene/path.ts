/**
 * The experience and education tier's path (a timeline, newest first) as the climb steps through
 * it: one stage in focus at a time, opened with its details, the others compact. The focus climbs
 * as the tower does, from the last stage (the degree) at the tier's first stop up to the first
 * (today) at its last; the stages it has passed stay marked, so the gold rail fills up to it.
 * Pure DOM, like ./projects.ts; the CSS lives with the markup (pages/index.astro).
 *
 * Until this runs the path is the static timeline, every stage open (`data-stepping` switches the
 * styles over), so nothing is ever hidden that a script didn't take charge of.
 *
 * The collapsed mobile sheet peeks at the stage in focus (`[data-stop-now]` under the tier's title,
 * like the projects tier's): a compact copy, its years and role, inert and hidden from assistive
 * tech, as the list below stays the one to read.
 */
export function createPath(list: HTMLElement) {
	const stages = [...list.querySelectorAll<HTMLElement>(':scope > .path__stage')];
	const last = stages.length - 1;
	let focus = -1;
	list.dataset.stepping = '';
	const now = list.closest('[data-tier-panel]')?.querySelector<HTMLElement>('[data-stop-now]') ?? null;
	/** the peek's copy of a stage: its years and role, on a list of its own, the mark lit */
	function compact(i: number) {
		// a bare clone of the list, so it keeps the attributes its scoped styles go by
		const ol = list.cloneNode(false) as HTMLElement;
		ol.className = 'path-now';
		ol.removeAttribute('data-stepping');
		ol.removeAttribute('style');
		const copy = stages[i].cloneNode(true) as HTMLElement;
		copy.classList.remove('is-on', 'is-past');
		copy.querySelector('.path__more')?.remove();
		ol.append(copy);
		return ol;
	}
	function showNow(i: number, animate: boolean) {
		if (!now) return;
		now.replaceChildren(compact(i));
		now.classList.remove('is-new');
		if (!animate) return;
		void now.offsetWidth; // restart the fade-in
		now.classList.add('is-new');
	}
	/**
	 * The peek keeps the height of its tallest copy (a role can take two lines), so the collapsed
	 * sheet, measured with it, shows the same from stop to stop. Only while it is shown: hidden (a
	 * wide screen, an open sheet) it has no size to measure.
	 */
	function reserveNow() {
		if (!now || !now.offsetParent) return;
		now.style.minBlockSize = '';
		let tallest = 0;
		stages.forEach((_, i) => {
			now.replaceChildren(compact(i));
			tallest = Math.max(tallest, now.getBoundingClientRect().height);
		});
		now.style.minBlockSize = `${Math.ceil(tallest)}px`;
		showNow(Math.max(0, focus), false);
	}

	function show(i: number, animate = true) {
		if (!animate) list.classList.add('is-measuring');
		stages.forEach((s, k) => {
			s.classList.toggle('is-on', k === i);
			s.classList.toggle('is-past', k > i);
		});
		if (!animate) {
			void list.offsetHeight;
			list.classList.remove('is-measuring');
		}
	}

	/**
	 * The list keeps the height of its tallest state (whichever stage, opened, makes it longest), so
	 * the panel holding it doesn't move from stop to stop.
	 */
	function reserve() {
		list.style.minBlockSize = '';
		list.classList.add('is-measuring');
		let tallest = 0;
		stages.forEach((_, i) => {
			show(i, true);
			tallest = Math.max(tallest, list.getBoundingClientRect().height);
		});
		if (focus >= 0) show(focus, true);
		void list.offsetHeight;
		list.classList.remove('is-measuring');
		list.style.minBlockSize = `${Math.ceil(tallest)}px`;
	}
	reserve();
	// the width (and with it the line breaks) changes with the window; the fonts change the metrics.
	// Only a new width re-measures: reserving changes the height, which mustn't set it off again.
	let width = list.getBoundingClientRect().width;
	const watch = new ResizeObserver(() => {
		const w = list.getBoundingClientRect().width;
		if (Math.abs(w - width) < 0.5) return;
		width = w;
		reserve();
	});
	watch.observe(list);
	// the peek, the same way: its width changes with the window, and from nothing when it shows
	let nowWidth = -1;
	const watchNow = new ResizeObserver(() => {
		const w = now ? now.getBoundingClientRect().width : 0;
		if (Math.abs(w - nowWidth) < 0.5) return;
		nowWidth = w;
		reserveNow();
	});
		if (now) watchNow.observe(now);
	reserveNow();
	document.fonts?.ready.then(() => { reserve(); reserveNow(); }).catch(() => {});

	return {
		/** The stop the climb is at on this tier, 0 (the degree) .. last (today). */
		update(stop: number) {
			const i = last - Math.min(last, Math.max(0, stop));
			if (i === focus) return;
			const first = focus < 0;
			focus = i;
			show(i, !first);
			showNow(i, !first);
		},
		dispose() {
			watch.disconnect();
			watchNow.disconnect();
			now?.replaceChildren();
			now?.style.removeProperty('min-block-size');
			delete list.dataset.stepping;
			list.style.removeProperty('min-block-size');
			stages.forEach((s) => s.classList.remove('is-on', 'is-past'));
		},
	};
}

export type Path = ReturnType<typeof createPath>;

