/**
 * Leaderboard API for the Tower of Babel brick-stacking game on shoobyd.github.io.
 *
 *   POST   /runs          → { run }                                a ticket for a run starting now
 *   GET    /scores        → { scores: Entry[] }                    the top BOARD_SIZE
 *   POST   /scores        { name, score, run, phases }
 *                         → { accepted: true, id, rank, scores }   when it makes the board
 *                         → { accepted: false, reason, scores }    when it doesn't (or is refused)
 *   DELETE /scores/:id    Authorization: Bearer <ADMIN_TOKEN>      removes an entry
 *
 * The site is static; this Worker is the only writer. It checks the origin and the name, takes
 * the run's ticket (`run`, from POST /runs) and replays its drops (`phases`): every brick has to
 * land and make the score, in no more time than passed since the ticket (rules.ts). It also
 * limits how often one client submits.
 */
import { BOARD_SIZE, checkName, replay } from './rules';

export interface Env {
	DB: D1Database;
	/** Comma-separated origins allowed to call the API. */
	ALLOWED_ORIGINS: string;
	/** Secret (wrangler secret put ADMIN_TOKEN); unset means deleting is disabled. */
	ADMIN_TOKEN?: string;
}

interface Entry {
	id: number;
	name: string;
	score: number;
	createdAt: number;
}

/** Submissions allowed per client per window. */
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;
/** Runs one client may start per minute (a run can end within seconds), and how long a ticket stays valid. */
const RUN_LIMIT = 30;
const RUN_TTL_MS = 2 * 60 * 60_000;
/** The ticket is stamped when its request arrives, a moment after the run began: allow for that. */
const CLOCK_SLACK_MS = 3000;

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const origin = request.headers.get('Origin');
		const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
		const cors = corsHeaders(origin && allowed.includes(origin) ? origin : null);

		if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

		const url = new URL(request.url);
		try {
			if (url.pathname === '/scores' && request.method === 'GET') {
				return json({ scores: await topScores(env.DB) }, 200, cors, 'public, max-age=15');
			}
			if (request.method === 'POST' && (url.pathname === '/scores' || url.pathname === '/runs')) {
				// browsers always send Origin on a cross-site POST: refuse anything not from the site
				if (!origin || !allowed.includes(origin)) return json({ error: 'origin' }, 403, cors);
				return url.pathname === '/runs' ? await startRun(request, env, cors) : await submit(request, env, cors);
			}
			const match = url.pathname.match(/^\/scores\/(\d+)$/);
			if (match && request.method === 'DELETE') return await remove(Number(match[1]), request, env, cors);
			return json({ error: 'not_found' }, 404, cors);
		} catch (err) {
			console.error('leaderboard:', err);
			return json({ error: 'server' }, 500, cors);
		}
	},
} satisfies ExportedHandler<Env>;

async function topScores(db: D1Database): Promise<Entry[]> {
	const { results } = await db
		.prepare('SELECT id, name, score, created_at AS createdAt FROM scores ORDER BY score DESC, created_at ASC LIMIT ?')
		.bind(BOARD_SIZE)
		.all<Entry>();
	return results;
}

/** A ticket for a run starting now, stamped with this server's clock (see migrations/0002_runs.sql). */
async function startRun(request: Request, env: Env, cors: HeadersInit): Promise<Response> {
	const now = Date.now();
	const client = await hashClient(request.headers.get('CF-Connecting-IP') ?? 'unknown');
	await env.DB.prepare('DELETE FROM runs WHERE started_at < ?').bind(now - RUN_TTL_MS).run();
	const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM runs WHERE client = ? AND started_at >= ?')
		.bind(client, now - RATE_WINDOW_MS)
		.first<{ n: number }>();
	if ((recent?.n ?? 0) >= RUN_LIMIT) return json({ error: 'rate_limited' }, 429, cors);
	const run = crypto.randomUUID();
	await env.DB.prepare('INSERT INTO runs (id, client, started_at) VALUES (?, ?, ?)').bind(run, client, now).run();
	return json({ run }, 201, cors);
}

async function submit(request: Request, env: Env, cors: HeadersInit): Promise<Response> {
	let body: { name?: unknown; score?: unknown; run?: unknown; phases?: unknown };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'bad_json' }, 400, cors);
	}

	const refuse = async (reason: string) => json({ accepted: false, reason, scores: await topScores(env.DB) }, 422, cors);

	// a name the board won't show keeps the ticket: the player can fix it and send the run again
	const named = checkName(body.name);
	if (!named.ok) return refuse(named.error);

	// from here on the ticket is used up, whatever the outcome
	const now = Date.now();
	const ticket =
		typeof body.run === 'string'
			? await env.DB.prepare('DELETE FROM runs WHERE id = ? RETURNING started_at AS startedAt').bind(body.run).first<{ startedAt: number }>()
			: null;
	if (!ticket || now - ticket.startedAt > RUN_TTL_MS) return refuse('run_invalid');
	const run = replay(body.phases);
	if (!run.ok || run.score !== body.score) return refuse('score_invalid');
	if (run.gameMs > now - ticket.startedAt + CLOCK_SLACK_MS) return refuse('too_fast');

	// rate limit per client, keyed by a hash of its address (the address itself is never stored)
	const client = await hashClient(request.headers.get('CF-Connecting-IP') ?? 'unknown');
	await env.DB.prepare('DELETE FROM submissions WHERE created_at < ?').bind(now - RATE_WINDOW_MS).run();
	const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM submissions WHERE client = ?').bind(client).first<{ n: number }>();
	if ((recent?.n ?? 0) >= RATE_LIMIT) return json({ accepted: false, reason: 'rate_limited', scores: await topScores(env.DB) }, 429, cors);
	await env.DB.prepare('INSERT INTO submissions (client, created_at) VALUES (?, ?)').bind(client, now).run();

	// only a score that beats the current last place (or fills an empty place) is kept
	const board = await topScores(env.DB);
	const last = board[BOARD_SIZE - 1];
	if (board.length >= BOARD_SIZE && run.score <= last.score) {
		return json({ accepted: false, reason: 'not_on_board', scores: board }, 200, cors);
	}

	const inserted = await env.DB.prepare('INSERT INTO scores (name, score, duration_ms, created_at) VALUES (?, ?, ?, ?) RETURNING id')
		.bind(named.name, run.score, Math.round(run.gameMs), now)
		.first<{ id: number }>();
	// keep the table to the board itself: anything pushed off it is dropped
	await env.DB.prepare(
		'DELETE FROM scores WHERE id NOT IN (SELECT id FROM scores ORDER BY score DESC, created_at ASC LIMIT ?)',
	)
		.bind(BOARD_SIZE)
		.run();

	const scores = await topScores(env.DB);
	const rank = scores.findIndex((s) => s.id === inserted?.id) + 1;
	return json({ accepted: true, id: inserted?.id, rank, scores }, 201, cors);
}

async function remove(id: number, request: Request, env: Env, cors: HeadersInit): Promise<Response> {
	const auth = request.headers.get('Authorization') ?? '';
	if (!env.ADMIN_TOKEN || !(await sameSecret(auth, `Bearer ${env.ADMIN_TOKEN}`))) return json({ error: 'unauthorized' }, 401, cors);
	const { meta } = await env.DB.prepare('DELETE FROM scores WHERE id = ?').bind(id).run();
	return json({ deleted: meta.changes > 0, scores: await topScores(env.DB) }, 200, cors);
}

// ---------- helpers ----------

function corsHeaders(origin: string | null): HeadersInit {
	const headers: Record<string, string> = {
		'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		'Access-Control-Max-Age': '86400',
		Vary: 'Origin',
	};
	if (origin) headers['Access-Control-Allow-Origin'] = origin;
	return headers;
}

function json(data: unknown, status: number, cors: HeadersInit, cache = 'no-store'): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache },
	});
}

async function sha256(text: string) {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** A per-day salted hash: enough to rate-limit, useless for tracking anyone across days. */
async function hashClient(ip: string) {
	const day = new Date().toISOString().slice(0, 10);
	return sha256(`tower-leaderboard:${day}:${ip}`);
}

/** Compares secrets in constant time (by comparing their hashes). */
async function sameSecret(a: string, b: string) {
	const [ha, hb] = await Promise.all([sha256(a), sha256(b)]);
	let diff = 0;
	for (let i = 0; i < ha.length; i++) diff |= ha.charCodeAt(i) ^ hb.charCodeAt(i);
	return diff === 0;
}

