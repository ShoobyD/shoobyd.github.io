/**
 * The experience and education tier's path (a timeline, newest first) as the climb steps through
 * it: one stage in focus at a time, opened with its details, the others compact. The focus climbs
 * as the tower does, from the last stage (the degree) at the tier's first stop up to the first
 * (today) at its last; the stages it has passed stay marked, so the gold rail fills up to it.
 * Pure DOM, like ./projects.ts; the CSS lives with the markup (pages/index.astro).
 *
 * Until this runs the path is the static timeline, every stage open (`data-stepping` switches the
 * styles over), so nothing is ever hidden that a script didn't take charge of.
 */
export function createPath(list: HTMLElement) {
	const stages = [...list.querySelectorAll<HTMLElement>(':scope > .path__stage')];
	const last = stages.length - 1;
	let focus = -1;
	list.dataset.stepping = '';

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
	document.fonts?.ready.then(reserve).catch(() => {});

	return {
		/** The stop the climb is at on this tier, 0 (the degree) .. last (today). */
		update(stop: number) {
			const i = last - Math.min(last, Math.max(0, stop));
			if (i === focus) return;
			const first = focus < 0;
			focus = i;
			show(i, !first);
		},
		dispose() {
			watch.disconnect();
			delete list.dataset.stepping;
			list.style.removeProperty('min-block-size');
			stages.forEach((s) => s.classList.remove('is-on', 'is-past'));
		},
	};
}

export type Path = ReturnType<typeof createPath>;

