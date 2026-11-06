/**
 * The single render loop. It pauses while the tab is hidden (no frames, no GPU work) and resumes
 * without a time jump; frame deltas are clamped so a stall never teleports the animation.
 */
import { clamp } from './util';

export type FrameFn = (dt: number, now: number) => void;

export function createLoop(frame: FrameFn) {
	let raf = 0;
	let last = 0;
	let running = false;
	let wanted = false;

	function tick(now: number) {
		const dt = clamp((now - last) / 1000, 0, 0.05);
		last = Math.max(last, now);
		frame(dt, now);
		if (running) raf = requestAnimationFrame(tick);
	}

	function run() {
		if (running || document.hidden) return;
		running = true;
		last = performance.now();
		raf = requestAnimationFrame(tick);
	}

	function halt() {
		running = false;
		cancelAnimationFrame(raf);
	}

	function onVisibility() {
		if (document.hidden) halt();
		else if (wanted) run();
	}
	document.addEventListener('visibilitychange', onVisibility);

	return {
		start() {
			wanted = true;
			run();
		},
		stop() {
			wanted = false;
			halt();
		},
		dispose() {
			wanted = false;
			halt();
			document.removeEventListener('visibilitychange', onVisibility);
		},
	};
}

