/**
 * The tower game's shared leaderboard, served by a small Cloudflare Worker (see leaderboard/ at
 * the repo root). The site stays static; this module only reads the board and submits a run.
 *
 * Every call resolves to `null` when the service can't be reached (offline, blocked, down), so the
 * game simply carries on without a board. Nothing here pulls in Three.js.
 */

/** Override with PUBLIC_LEADERBOARD_URL (e.g. a local `wrangler dev` at http://localhost:8787). */
const API = (import.meta.env.PUBLIC_LEADERBOARD_URL as string | undefined) ?? 'https://shoobyd-tower-leaderboard.bmusty.workers.dev';

/** The board's size; the Worker enforces the same (leaderboard/src/rules.ts). */
export const BOARD_SIZE = 10;
export const NAME_MAX = 20;

/** The last name used on this device, to prefill the next time. */
const NAME_KEY = 'shoobyd:tower:name';
const TIMEOUT_MS = 6000;

export interface BoardEntry {
	id: number;
	name: string;
	score: number;
	createdAt: number;
}

export type RefusalReason =
	| 'score_invalid'
	| 'too_fast'
	| 'name_empty'
	| 'name_long'
	| 'name_chars'
	| 'name_banned'
	| 'rate_limited'
	| 'not_on_board';

export type SubmitResult =
	| { accepted: true; id: number; rank: number; scores: BoardEntry[] }
	| { accepted: false; reason: RefusalReason; scores: BoardEntry[] };

async function call(path: string, init?: RequestInit): Promise<Response | null> {
	try {
		return await fetch(`${API}${path}`, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
	} catch {
		return null;
	}
}

/** The current board, best first; `null` when the service can't be reached. */
export async function fetchBoard(): Promise<BoardEntry[] | null> {
	const res = await call('/scores');
	if (!res?.ok) return null;
	try {
		const data = (await res.json()) as { scores?: BoardEntry[] };
		return Array.isArray(data.scores) ? data.scores : null;
	} catch {
		return null;
	}
}

/** Submits a run; `null` when the service can't be reached or answers with an error of its own. */
export async function submitScore(run: { name: string; score: number; durationMs: number }): Promise<SubmitResult | null> {
	const res = await call('/scores', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(run),
	});
	if (!res) return null;
	try {
		const data = (await res.json()) as Partial<SubmitResult> & { error?: string };
		if (data.accepted === true && Array.isArray(data.scores)) return data as SubmitResult;
		if (data.accepted === false && data.reason && Array.isArray(data.scores)) return data as SubmitResult;
		return null;
	} catch {
		return null;
	}
}

/** Whether a score would make the board as it stands (the Worker has the final word). */
export function makesBoard(board: BoardEntry[], score: number) {
	if (score < 1) return false;
	return board.length < BOARD_SIZE || score > board[BOARD_SIZE - 1].score;
}

/** Where a score would land on the board: a 0-based index, after any equal scores. */
export function slotFor(board: BoardEntry[], score: number) {
	const i = board.findIndex((e) => e.score < score);
	return i < 0 ? board.length : i;
}

export function rememberedName() {
	try {
		return window.localStorage.getItem(NAME_KEY) ?? '';
	} catch {
		return '';
	}
}

export function rememberName(name: string) {
	try {
		window.localStorage.setItem(NAME_KEY, name);
	} catch {
		// storage blocked: the name just isn't prefilled next time
	}
}

