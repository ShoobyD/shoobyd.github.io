/**
 * The leaderboard's rules: the size of the board, what a name may be, and whether a score is
 * physically possible in the time the game says it took.
 *
 * The timing model mirrors the game (src/components/tower/scene/game/stack.ts in the site); if
 * the game's AMP / BS / SPEED0 / SPEED_MAX / speed growth change, change them here too.
 */
import { BANNED } from './banned';

export const BOARD_SIZE = 10;
export const NAME_MAX = 20;
/** A run longer than this can't be scored (and keeps the plausibility sum bounded). */
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

// ---------- plausibility ----------

/** How far a brick starts from the stack, and the widest a brick can be (the game's AMP and BS). */
const AMP = 3.6;
const BRICK = 2.8;
const SPEED0 = 2.4;
const SPEED_MAX = 6.5;
const SPEED_GROWTH = 1.045;

/**
 * Each brick swings in as `sin(phase) * AMP`, starting at phase −π/2, so even the widest brick
 * can't be dropped onto the stack before its phase has advanced this far.
 */
const MIN_PHASE = Math.asin(-BRICK / AMP) + Math.PI / 2;

/** Frame timing and timer resolution: accept runs down to this fraction of the ideal minimum. */
const SLACK = 0.75;

/** The fastest a perfect player could lay `score` bricks, in milliseconds. */
export function minimumDurationMs(score: number) {
	let speed = SPEED0;
	let seconds = 0;
	for (let i = 0; i < score; i++) {
		seconds += MIN_PHASE / speed;
		speed = Math.min(SPEED_MAX, speed * SPEED_GROWTH);
	}
	return seconds * 1000;
}

export function checkScore(score: unknown, durationMs: unknown): { ok: true; score: number; durationMs: number } | { ok: false; error: 'score_invalid' | 'too_fast' } {
	if (!Number.isInteger(score) || (score as number) < 1 || (score as number) > SCORE_MAX) return { ok: false, error: 'score_invalid' };
	if (typeof durationMs !== 'number' || !Number.isFinite(durationMs) || durationMs <= 0) return { ok: false, error: 'score_invalid' };
	if (durationMs < minimumDurationMs(score as number) * SLACK) return { ok: false, error: 'too_fast' };
	return { ok: true, score: score as number, durationMs: Math.round(durationMs) };
}

