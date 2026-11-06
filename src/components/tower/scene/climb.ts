/**
 * The DOM half of the climb: reads scroll progress from the tier sections, steers to a tier
 * (keyboard, focus), and fades/slides each fixed panel in and out around its tier.
 * Panels stay real, focusable DOM; this only sets their opacity and transform.
 */
import { clamp, sstep } from './util';
import { progressAt, scrollFor, sectionTops } from '../mode';

export function createClimb(sections: HTMLElement[], panels: HTMLElement[]) {
	const last = sections.length - 1;
	let tops = sectionTops(sections);
	let raw = progressAt(tops, window.scrollY);
	const shown = panels.map(() => ({ o: -1, ty: NaN }));

	const read = () => {
		raw = progressAt(tops, window.scrollY);
	};
	const measure = () => {
		tops = sectionTops(sections);
		read();
	};

	/** Jumps the scroll to a tier's park; the camera then flies there on its own smoothing. */
	function goTier(i: number) {
		window.scrollTo({ top: tops[clamp(Math.round(i), 0, last)], behavior: 'instant' });
		read();
	}

	// arrow / page keys step one tier at a time; Home and End go to the base and the summit
	function onKey(e: KeyboardEvent) {
		if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
		const t = e.target as HTMLElement | null;
		if (t?.closest?.('input, textarea, select, [contenteditable]')) return;
		const cur = Math.round(raw);
		let to: number | null = null;
		if (e.key === 'ArrowDown' || e.key === 'PageDown') to = cur + 1;
		else if (e.key === 'ArrowUp' || e.key === 'PageUp') to = cur - 1;
		else if (e.key === 'Home') to = 0;
		else if (e.key === 'End') to = last;
		if (to === null) return;
		e.preventDefault();
		goTier(to);
	}

	// tabbing into a panel that is faded out brings its tier into view
	const onFocus = panels.map((_, i) => () => {
		if (Math.round(raw) !== i) goTier(i);
	});

	window.addEventListener('scroll', read, { passive: true });
	window.addEventListener('keydown', onKey);
	panels.forEach((p, i) => p.addEventListener('focusin', onFocus[i]));

	return {
		get progress() {
			return raw;
		},
		get tops() {
			return tops;
		},
		measure,
		goTier,
		/** Scrolls to a fractional progress (used to carry the reading position across a layout switch). */
		goTo(p: number) {
			window.scrollTo({ top: scrollFor(tops, p), behavior: 'instant' });
			read();
		},
		/**
		 * Each panel is fully shown within ±0.14 tier of its park and gone by ±0.46, drifting
		 * upward as it leaves. `enter` (0..1) fades the whole set in when the 3D mode starts.
		 */
		updatePanels(progress: number, enter: number) {
			panels.forEach((el, i) => {
				const d = progress - i;
				const o = (1 - sstep(0.14, 0.46, Math.abs(d))) * enter;
				const ty = -d * 70 + (1 - enter) * 18;
				const s = shown[i];
				if (Math.abs(o - s.o) < 0.002 && Math.abs(ty - s.ty) < 0.2) return;
				el.style.opacity = o.toFixed(3);
				el.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0)`;
				el.classList.toggle('is-on', o > 0.6);
				s.o = o;
				s.ty = ty;
			});
		},
		dispose() {
			window.removeEventListener('scroll', read);
			window.removeEventListener('keydown', onKey);
			panels.forEach((p, i) => {
				p.removeEventListener('focusin', onFocus[i]);
				p.style.removeProperty('opacity');
				p.style.removeProperty('transform');
				p.classList.remove('is-on');
			});
		},
	};
}

export type Climb = ReturnType<typeof createClimb>;

