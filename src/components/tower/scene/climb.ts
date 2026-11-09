/**
 * The DOM half of the climb: reads scroll progress from the tier sections, steers to a tier
 * (keyboard, focus), and fades/slides each fixed panel in and out around its tier.
 * Panels stay real, focusable DOM; this only sets their opacity and transform.
 *
 * A tier with stops (`data-stops`, e.g. one per project on the code tier) holds the climb while
 * the scroll steps through them (see ../mode.ts); `stop` reads where in them the scroll is, and
 * the arrow and page keys step through them one at a time like tiers.
 */
import { clamp, sstep } from './util';
import { progressAt, scrollFor, sectionHolds, sectionTops } from '../mode';

export function createClimb(sections: HTMLElement[], panels: HTMLElement[]) {
	const last = sections.length - 1;
	let tops = sectionTops(sections);
	let holds = sectionHolds(sections);
	let raw = progressAt(tops, window.scrollY, holds);
	const shown = panels.map(() => ({ o: -1, ty: NaN }));
	const stopCounts = sections.map((s) => Number(s.dataset.stops) || 0);

	const read = () => {
		raw = progressAt(tops, window.scrollY, holds);
	};
	const measure = () => {
		tops = sectionTops(sections);
		holds = sectionHolds(sections);
		read();
		// content grows without its box growing (fonts, images): the fades follow
		edges.forEach((e) => e());
	};

	/** Jumps the scroll to a tier's park; the camera then flies there on its own smoothing. */
	function goTier(i: number) {
		window.scrollTo({ top: tops[clamp(Math.round(i), 0, last)], behavior: 'instant' });
		read();
	}

	/** Tier `i`'s stop `k` as a scroll position: its hold spread evenly over its stops. */
	const stopScroll = (i: number, k: number) => tops[i] + (holds[i] * k) / Math.max(1, stopCounts[i] - 1);

	/** Where in its stops the scroll is (fractional, 0 .. count - 1) while a tier holds the climb, else null. */
	function stopNow() {
		const i = Math.round(raw);
		if (raw !== i || !holds[i] || stopCounts[i] < 2) return null;
		const at = clamp((window.scrollY - tops[i]) / holds[i], 0, 1) * (stopCounts[i] - 1);
		return { tier: i, at };
	}

	function goStop(i: number, k: number) {
		window.scrollTo({ top: stopScroll(i, k), behavior: 'instant' });
		read();
	}

	// arrow / page keys step one tier (or one stop) at a time; Home and End go to the base and the summit
	function onKey(e: KeyboardEvent) {
		if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
		const t = e.target as HTMLElement | null;
		// form fields keep their keys, and so does an open dialog (the enlarged self-portrait)
		if (t?.closest?.('input, textarea, select, [contenteditable], dialog[open]')) return;
		const down = e.key === 'ArrowDown' || e.key === 'PageDown';
		const up = e.key === 'ArrowUp' || e.key === 'PageUp';
		if (!down && !up && e.key !== 'Home' && e.key !== 'End') return;
		e.preventDefault();
		const cur = Math.round(raw);
		const stop = stopNow();
		if (stop) {
			const k = Math.round(stop.at);
			if (down && k < stopCounts[cur] - 1) return goStop(cur, k + 1);
			if (up && k > 0) return goStop(cur, k - 1);
		}
		if (e.key === 'Home') return goTier(0);
		if (e.key === 'End') return goTier(last);
		const to = clamp(cur + (down ? 1 : -1), 0, last);
		// stepping back down into a tier with stops lands on its last one
		if (up && to !== cur && holds[to]) return goStop(to, stopCounts[to] - 1);
		goTier(to);
	}

	// tabbing into a panel that is faded out brings its tier into view
	const onFocus = panels.map((_, i) => () => {
		if (Math.round(raw) !== i) goTier(i);
	});

	// a panel whose content scrolls (wide screens, a short window) fades it at the top once scrolled
	// and at the bottom while there is more below (TierSection.vue)
	const bodies = panels.map((p) => p.querySelector<HTMLElement>('.tier__body'));
	const FADE = '28px';
	// and its scrollbar, pale at rest, shows in full while it scrolls and for a moment after
	const scrolling = bodies.map(() => 0);
	const onScroll = bodies.map((b, i) => () => {
		if (!b) return;
		edges[i]();
		b.classList.add('is-scrolling');
		window.clearTimeout(scrolling[i]);
		scrolling[i] = window.setTimeout(() => b.classList.remove('is-scrolling'), 900);
	});
	const edges = bodies.map((b) => () => {
		if (!b) return;
		const more = b.scrollHeight - b.clientHeight - b.scrollTop;
		b.style.setProperty('--fade-top', b.scrollTop > 1 ? FADE : '0px');
		b.style.setProperty('--fade-bottom', more > 1 ? FADE : '0px');
	});
	const watchEdges = new ResizeObserver(() => edges.forEach((e) => e()));
	bodies.forEach((b, i) => {
		if (!b) return;
		b.addEventListener('scroll', onScroll[i], { passive: true });
		watchEdges.observe(b);
		edges[i]();
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
		/** The tier holding the climb and where in its stops the scroll is (fractional), or null. */
		get stop() {
			return stopNow();
		},
		measure,
		goTier,
		/** Scrolls to a fractional progress (used to carry the reading position across a layout switch). */
		goTo(p: number) {
			window.scrollTo({ top: scrollFor(tops, p, holds), behavior: 'instant' });
			read();
		},
		/**
		 * Each panel is fully shown within ±0.14 tier of its park and gone by ±0.46, drifting
		 * upward as it leaves. `enter` (0..1) fades the whole set in when the climb starts; `drift`
		 * scales the movement (0 with reduced motion: they only fade).
		 */
		updatePanels(progress: number, enter: number, drift = 1) {
			panels.forEach((el, i) => {
				const d = progress - i;
				const o = (1 - sstep(0.14, 0.46, Math.abs(d))) * enter;
				const ty = (-d * 70 + (1 - enter) * 18) * drift;
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
			watchEdges.disconnect();
			bodies.forEach((b, i) => {
				if (!b) return;
				b.removeEventListener('scroll', onScroll[i]);
				window.clearTimeout(scrolling[i]);
				b.classList.remove('is-scrolling');
				b.style.removeProperty('--fade-top');
				b.style.removeProperty('--fade-bottom');
			});
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

