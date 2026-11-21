/**
 * The leaderboard's rules: the size of the board, what a name may be, and the replay that turns a
 * run's drops into its score.
 *
 * The replay mirrors the game (src/components/tower/scene/game/stack.ts in the site); if the
 * game's AMP / BS / PERFECT / SPEED0 / SPEED_MAX / speed growth or its arithmetic change, change
 * them here too.
 */
import { BANNED } from './banned';

export const BOARD_SIZE = 10;
export const NAME_MAX = 20;
/** A run longer than this can't be scored (and keeps the replay bounded). */
export const SCORE_MAX = 500;

// ---------- names ----------

// letters (Hebrew and Latin), digits, a space, and a few joiners
const NAME_CHARS = /^[\p{Script=Hebrew}\p{Script=Latin}\p{Nd} ._'\-]+$/u;

/**
 * Cleans a submitted name and decides whether it may be shown.
 * Returns the cleaned name, or an error code the game can show in its own language.
 */
export function checkName(raw: unknown): { ok: true; name: string } | { ok: false; error: 'name_empty' | 'name_long' | 'name_chars' | 'name_banned' } {
	if (typeof raw !== 'string') return { ok: false, error: 'name_empty' };
	const name = raw.normalize('NFC').replace(/\s+/g, ' ').trim();
	if (!name) return { ok: false, error: 'name_empty' };
	if ([...name].length > NAME_MAX) return { ok: false, error: 'name_long' };
	if (!NAME_CHARS.test(name)) return { ok: false, error: 'name_chars' };
	if (isBanned(name)) return { ok: false, error: 'name_banned' };
	return { ok: true, name };
}

/** Lower-cases and drops joiners and Hebrew vowel points, so "B.a.d" and a pointed spelling match. */
const fold = (s: string) => s.toLowerCase().replace(/[._'\-֑-ׇ]/g, '');

/**
 * A short banned word only matches a whole word (so "humour" or a surname that merely contains
 * it pass), a long one also matches inside a word; the name with its spaces removed is checked
 * the same way, so "b a d w o r d" doesn't slip through.
 */
function isBanned(name: string) {
	const words = name.split(' ').map(fold);
	const joined = words.join('');
	return BANNED.some((bad) => {
		const inside = [...bad].length >= 5;
		return [...words, joined].some((w) => w === bad || (inside && w.includes(bad)));
	});
}

// ---------- replay ----------

/**
 * The stack's rules, as the game plays them (src/components/tower/scene/game/stack.ts in the
 * site): the reach a brick swings over, the first brick's footprint, how close a drop snaps as
 * perfect, and the swing's speed and how it grows per brick.
 */
const AMP = 3.6;
const BRICK = 2.8;
const PERFECT = 0.13;
const SPEED0 = 2.4;
const SPEED_MAX = 6.5;
const SPEED_GROWTH = 1.045;

/**
 * Replays a run from the phase each brick was dropped at, with the same arithmetic as the game:
 * brick `i` swings on the x axis when `i` is even and z when odd, at `sin(phase) * AMP` from the
 * brick below; a drop that misses ends the run, one within PERFECT snaps on top, any other one
 * loses its overhang. Every phase sent must be a brick that landed, so the score is their count.
 *
 * A brick starts at phase −π/2 and its phase grows at the speed of the moment, so the phases
 * also give how long the bricks were moving (`gameMs`): no more than the run's real time.
 */
export function replay(phases: unknown): { ok: true; score: number; gameMs: number } | { ok: false } {
	if (!Array.isArray(phases) || phases.length < 1 || phases.length > SCORE_MAX) return { ok: false };
	const top = { x: 0, z: 0, w: BRICK, d: BRICK };
	let speed = SPEED0;
	let seconds = 0;
	for (let i = 0; i < phases.length; i++) {
		const phase: unknown = phases[i];
		if (typeof phase !== 'number' || !Number.isFinite(phase) || phase < -Math.PI / 2) return { ok: false };
		const ax = i % 2 === 0 ? 'x' : 'z';
		const size = ax === 'x' ? top.w : top.d;
		const delta = top[ax] + Math.sin(phase) * AMP - top[ax];
		if (Math.abs(delta) >= size) return { ok: false };
		if (Math.abs(delta) >= PERFECT) {
			const keep = size - Math.abs(delta);
			top[ax] += delta / 2;
			if (ax === 'x') top.w = keep;
			else top.d = keep;
		}
		seconds += (phase + Math.PI / 2) / speed;
		speed = Math.min(SPEED_MAX, speed * SPEED_GROWTH);
	}
	return { ok: true, score: phases.length, gameMs: seconds * 1000 };
}

