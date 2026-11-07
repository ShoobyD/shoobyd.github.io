/**
 * Game mode: add bricks to the tower. Built only from the scene's public handle (its scene, the
 * tower group, the plinth height, the brick texture, `goTier` and the `setDirector` seam), so
 * the climb knows nothing about the game.
 *
 * The UI (Vue, in TowerGame.vue) calls enter / drop / again / exit and hears back through
 * `GameEvents`. Bricks laid in a run stay on the tower after leaving; the next run (entering
 * again, or "again") starts over on the bare plinth. They live in the GPU scene only, so a
 * teardown of the 3D (reduced motion switched on, a lost context) loses them with it.
 */
import { LAST_TIER } from '../dimensions';
import type { TowerHandle } from '../index';
import { createStack } from './stack';
import { createGameDirector } from './director';

export interface GameEvents {
	/** A brick was laid; `perfect` when it snapped into place, `best` the record after it. */
	onLaid(score: number, best: number, perfect: boolean, newBest: boolean): void;
	/**
	 * The brick missed the stack: the run is over. `durationMs` runs from the start of the run to
	 * the last brick laid; the leaderboard uses it to tell a real run from an impossible one.
	 */
	onOver(score: number, durationMs: number): void;
	/** Eight bricks in one run: the SD-08 secret. */
	onSecret(): void;
}

/** The best run, kept in this browser only. */
export const BEST_KEY = 'shoobyd:tower:best';
/** Bricks in one run that unlock the SD-08 secret. */
export const SECRET_AT = 8;

function readBest() {
	try {
		const n = Number(window.localStorage.getItem(BEST_KEY));
		return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
	} catch {
		return 0;
	}
}

function writeBest(n: number) {
	try {
		window.localStorage.setItem(BEST_KEY, String(n));
	} catch {
		// storage blocked (private mode, a full quota): the best simply isn't remembered
	}
}

export function createGame(tower: TowerHandle, events: GameEvents) {
	const stack = createStack(tower.tower, tower.plinthTop, tower.brick);
	let attached = false;
	const director = createGameDirector(tower.scene, stack, () => {
		attached = false;
		tower.setDirector(null);
	});
	let active = false;
	let best = readBest();
	let unlocked = false;
	let runStart = 0;
	let lastLaid = 0;

	function start() {
		unlocked = false;
		runStart = lastLaid = performance.now();
		stack.reset();
	}

	return {
		get active() {
			return active;
		},
		get over() {
			return stack.over;
		},
		get best() {
			return best;
		},
		/** Flies up to the summit plinth and starts a run. */
		enter() {
			if (active) return;
			active = true;
			// park the climb at the summit too, so leaving lands there
			tower.goTier(LAST_TIER);
			director.active = true;
			if (!attached) {
				attached = true;
				tower.setDirector(director);
			}
			start();
		},
		/** Back to the climb; the bricks laid stay where they are. */
		exit() {
			if (!active) return;
			active = false;
			stack.clearMoving();
			director.active = false;
		},
		drop() {
			if (!active) return;
			const r = stack.drop();
			if (!r) return;
			if (r.kind === 'miss') {
				events.onOver(r.score, lastLaid - runStart);
				return;
			}
			lastLaid = performance.now();
			const newBest = r.score > best;
			if (newBest) {
				best = r.score;
				writeBest(best);
			}
			events.onLaid(r.score, best, r.kind === 'perfect', newBest);
			if (r.score === SECRET_AT && !unlocked) {
				unlocked = true;
				events.onSecret();
			}
		},
		/** A new run after a fall. */
		again() {
			if (active) start();
		},
		dispose() {
			active = false;
			if (attached) tower.setDirector(null);
			attached = false;
			stack.dispose();
			director.dispose();
		},
	};
}

export type Game = ReturnType<typeof createGame>;

