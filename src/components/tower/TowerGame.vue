<script setup lang="ts">
/**
 * Game mode's DOM: the HUD (score, best, hint, the "perfect" flash), the game-over card, the
 * SD-08 toast and a screen-reader live region. It lives inside the tower island and is mounted
 * only while the 3D scene is live, so it gets the scene handle directly as a prop; the game
 * itself (scene/game/) plugs into the scene through that handle.
 *
 * Two ways in. The header button is server-rendered by the page, so it works as plain markup and
 * is wired here by data attribute: `[data-tower-game="toggle"]` (`aria-pressed`, with a
 * `[data-tower-game-label]` span; any `[data-tower-game="enter"]` control would only enter); the
 * page CSS shows it only under `html.webgl`. And a click or tap on the tower's unfinished top: the
 * scene sends `tower:play`.
 *
 * While playing, the root carries `html.tower-game`: the page stops scrolling, the panels, gauge
 * and footer are `inert` (and faded), and click / tap / Space / Enter drop a brick, Esc leaves.
 */
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import ArchPanel from '../../theme/components/ArchPanel.vue';
import GameBoard from './GameBoard.vue';
import type { GameCopy } from '../../i18n/home';
import type { Game, TowerHandle } from './scene';

const props = defineProps<{
	tower: TowerHandle;
	copy: GameCopy;
}>();

/** On the root while game mode is on; the page CSS keys the scroll lock and the fades off it. */
const GAME_CLASS = 'tower-game';
/** Everything behind the game that must not take focus or clicks while playing. */
const BEHIND = '[data-tier-panel], [data-tower-chrome], .sd-footer';
/** Keys that would scroll the page or step the climb. */
const CLIMB_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End']);

const active = ref(false);
const score = ref(0);
const best = ref(0);
const perfect = ref(false);
const secret = ref(false);
const overText = ref('');
const announcement = ref('');
const dialog = ref<HTMLDialogElement | null>(null);
const againBtn = ref<HTMLButtonElement | null>(null);
/** The run that just ended, for the leaderboard; `boardRun` is bumped per run so it reloads. */
const lastRun = ref({ score: 0, durationMs: 0 });
const boardRun = ref(0);

let game: Game | null = null;
let alive = true;
let controls: HTMLButtonElement[] = [];
let returnTo: HTMLElement | null = null;
const timers = { perfect: 0, secret: 0, over: 0 };

const fill = (s: string, n: number) => s.replace('{n}', String(n));

/** The live region re-announces identical text only if it changes first. */
async function announce(text: string) {
	announcement.value = '';
	await nextTick();
	announcement.value = text;
}

function syncToggles() {
	for (const c of controls) {
		if (c.dataset.towerGame !== 'toggle') continue;
		c.setAttribute('aria-pressed', String(active.value));
		const label = c.querySelector('[data-tower-game-label]');
		if (label) label.textContent = active.value ? props.copy.exit : props.copy.enter;
	}
}

function setBehind(off: boolean) {
	document.querySelectorAll<HTMLElement>(BEHIND).forEach((el) => {
		el.inert = off;
	});
}

function closeDialog() {
	window.clearTimeout(timers.over);
	if (dialog.value?.open) dialog.value.close();
}

function enter(from: HTMLElement | null) {
	if (!game || active.value) return;
	returnTo = from;
	game.enter();
	active.value = true;
	score.value = 0;
	best.value = game.best;
	document.documentElement.classList.add(GAME_CLASS);
	setBehind(true);
	syncToggles();
	announce(props.copy.announceStart);
}

/** Back to the climb; focus returns to the control that entered (unless the scene is going away). */
function exit(restoreFocus = true) {
	if (!active.value) return;
	game?.exit();
	active.value = false;
	perfect.value = false;
	closeDialog();
	document.documentElement.classList.remove(GAME_CLASS);
	setBehind(false);
	syncToggles();
	if (restoreFocus) returnTo?.focus({ preventScroll: true });
	returnTo = null;
}

function again() {
	closeDialog();
	score.value = 0;
	game?.again();
}

/** A click or tap on the tower's unfinished top (the scene sends `tower:play`); focus comes back to the header toggle. */
function onPlay() {
	enter(controls.find((c) => c.dataset.towerGame === 'toggle') ?? null);
}

function onControl(e: Event) {
	const c = e.currentTarget as HTMLButtonElement;
	if (c.dataset.towerGame === 'toggle' && active.value) exit();
	else enter(c);
}

function onKeyDown(e: KeyboardEvent) {
	if (!active.value || e.altKey || e.ctrlKey || e.metaKey) return;
	const t = e.target as Element | null;
	// the game-over dialog owns its keys (Esc arrives there as `cancel`)
	if (t?.closest?.('dialog')) return;
	if (e.key === 'Escape') {
		e.preventDefault();
		exit();
	} else if (e.key === ' ' || e.key === 'Enter') {
		// Enter on a focused control (the header toggle) keeps its meaning
		if (e.key === 'Enter' && t?.closest?.('button, a')) return;
		e.preventDefault();
		if (!e.repeat) game?.drop();
	} else if (CLIMB_KEYS.has(e.key)) {
		// registered in the capture phase, so the climb sees the key already handled and stays put
		e.preventDefault();
	}
}

// Space is taken by the game, so a focused button must not also activate on its release
function onKeyUp(e: KeyboardEvent) {
	if (active.value && e.key === ' ' && !(e.target as Element | null)?.closest?.('dialog')) e.preventDefault();
}

function onPointerDown(e: PointerEvent) {
	if (!active.value || !e.isPrimary || e.button !== 0) return;
	if ((e.target as Element | null)?.closest?.('button, a, dialog, header')) return;
	game?.drop();
}

function onCancel(e: Event) {
	// Esc on the game-over card leaves the game, as it does everywhere else in it
	e.preventDefault();
	exit();
}

onMounted(async () => {
	controls = [...document.querySelectorAll<HTMLButtonElement>('[data-tower-game]')];
	controls.forEach((c) => c.addEventListener('click', onControl));
	window.addEventListener('keydown', onKeyDown, { capture: true });
	window.addEventListener('keyup', onKeyUp, { capture: true });
	window.addEventListener('pointerdown', onPointerDown);
	window.addEventListener('tower:play', onPlay);

	// the scene chunk is already loaded by now; this only picks the game out of it
	const { createGame } = await import('./scene');
	if (!alive) return;
	game = createGame(props.tower, {
		onLaid(n, record, wasPerfect, newBest) {
			score.value = n;
			best.value = record;
			let text = fill(props.copy.announceScore, n);
			if (wasPerfect) {
				perfect.value = true;
				window.clearTimeout(timers.perfect);
				timers.perfect = window.setTimeout(() => (perfect.value = false), 650);
				text = `${props.copy.perfect} ${text}`;
			}
			if (newBest) text = `${text}. ${props.copy.announceBest}`;
			announce(text);
		},
		onOver(n, durationMs) {
			overText.value = fill(props.copy.overText, n);
			// start loading the board now, so it is usually there by the time the card comes up
			lastRun.value = { score: n, durationMs };
			boardRun.value++;
			announce(overText.value);
			// let the brick tumble before the card comes up
			window.clearTimeout(timers.over);
			timers.over = window.setTimeout(() => {
				if (!active.value || !game?.over || !dialog.value || dialog.value.open) return;
				dialog.value.showModal();
				// a run that made the board starts on its name field; otherwise on "again"
				const nameField = dialog.value.querySelector<HTMLInputElement>('#board-name');
				(nameField ?? againBtn.value)?.focus();
			}, 700);
		},
		onSecret() {
			secret.value = true;
			window.clearTimeout(timers.secret);
			timers.secret = window.setTimeout(() => (secret.value = false), 6000);
			announce(`${props.copy.secretTitle}. ${props.copy.secretBody}`);
		},
	});
	best.value = game.best;
});

/** Leaves game mode and frees the game; TowerScene calls it before tearing the scene down. */
function shutdown() {
	exit(false);
	game?.dispose();
	game = null;
}

defineExpose({ shutdown });

onBeforeUnmount(() => {
	alive = false;
	shutdown();
	controls.forEach((c) => c.removeEventListener('click', onControl));
	window.removeEventListener('keydown', onKeyDown, { capture: true });
	window.removeEventListener('keyup', onKeyUp, { capture: true });
	window.removeEventListener('pointerdown', onPointerDown);
	window.removeEventListener('tower:play', onPlay);
	Object.values(timers).forEach((t) => window.clearTimeout(t));
});
</script>

<template>
	<div class="game-hud" :class="{ 'is-on': active }" aria-hidden="true">
		<div class="game-hud__score">
			<span class="game-hud__num">{{ score }}</span>
			<span class="game-hud__label">{{ copy.bricks }}</span>
			<span class="game-hud__best">{{ copy.best }} <b>{{ best }}</b></span>
		</div>
		<p class="game-hud__perfect" :class="{ 'is-on': perfect }">{{ copy.perfect }}</p>
		<p class="game-hud__hint">
			<span class="game-hud__hint-pointer">{{ copy.hint }}</span>
			<span class="game-hud__hint-touch">{{ copy.hintTouch }}</span>
		</p>
	</div>

	<div class="game-toast" :class="{ 'is-on': secret }" aria-hidden="true">
		<strong>{{ copy.secretTitle }}</strong>
		<span>{{ copy.secretBody }}</span>
	</div>

	<p class="sd-visually-hidden" role="status" aria-live="polite">{{ announcement }}</p>

	<dialog
		ref="dialog"
		class="game-over"
		aria-labelledby="game-over-title"
		aria-describedby="game-over-text"
		@cancel="onCancel"
	>
		<ArchPanel as="div" class="game-over__card">
			<h2 id="game-over-title">{{ copy.overTitle }}</h2>
			<p id="game-over-text">{{ overText }}</p>
			<GameBoard
				v-if="boardRun > 0"
				:copy="copy.board"
				:score="lastRun.score"
				:duration-ms="lastRun.durationMs"
				:run="boardRun"
				@announce="announce"
				@added="againBtn?.focus()"
			/>
			<div class="game-over__actions">
				<button ref="againBtn" class="sd-control sd-control--gold" type="button" @click="again">{{ copy.again }}</button>
				<button class="sd-control" type="button" @click="exit()">{{ copy.exit }}</button>
			</div>
		</ArchPanel>
	</dialog>
</template>

<style scoped>
/* ---------- the HUD: over the canvas, under the header, never in the way of a tap ---------- */
.game-hud {
	position: fixed;
	z-index: 12;
	inset: 0;
	pointer-events: none;
	opacity: 0;
	visibility: hidden;
	transition: opacity var(--sd-dur) var(--sd-ease), visibility 0s linear var(--sd-dur);
}

.game-hud.is-on {
	opacity: 1;
	visibility: visible;
	transition: opacity var(--sd-dur) var(--sd-ease);
}

.game-hud__score {
	position: absolute;
	inset-block-start: clamp(76px, 12vh, 116px);
	inset-inline: 0;
	display: grid;
	justify-items: center;
	text-align: center;
	text-shadow: var(--sd-shadow-text);
}

.game-hud__num {
	font-family: var(--sd-font-display);
	font-size: clamp(4rem, 10vw, 7rem);
	line-height: 0.9;
	font-variant-numeric: tabular-nums;
	text-shadow: 0 4px 30px rgb(10 8 6 / 0.6), var(--sd-shadow-text);
}

.game-hud__label {
	font-weight: 700;
	font-size: 0.85rem;
	letter-spacing: 0.1em;
	color: var(--sd-gold);
}

.game-hud__best {
	margin-block-start: var(--sd-space-1);
	font-size: var(--sd-text-sm);
	color: var(--sd-text-dim);
}

.game-hud__best b {
	font-variant-numeric: tabular-nums;
	color: var(--sd-text);
}

.game-hud__perfect {
	position: absolute;
	inset-block-start: 42%;
	inset-inline: 0;
	font-family: var(--sd-font-display);
	font-size: 2.2rem;
	text-align: center;
	color: var(--sd-gold-hot);
	text-shadow: 0 0 24px rgb(255 190 100 / 0.8), var(--sd-shadow-text);
	opacity: 0;
	transform: scale(0.8);
	transition: opacity 0.2s, transform 0.4s var(--sd-ease);
}

.game-hud__perfect.is-on {
	opacity: 1;
	transform: none;
}

.game-hud__hint {
	position: absolute;
	inset-block-end: clamp(20px, 5vh, 46px);
	inset-inline: 0;
	margin-inline: auto;
	inline-size: fit-content;
	max-inline-size: calc(100% - 2 * var(--sd-gutter));
	padding-block: var(--sd-space-2);
	padding-inline: var(--sd-space-4);
	background: var(--sd-glass-strong);
	border-radius: var(--sd-pill);
	font-size: 0.95rem;
	text-align: center;
}

/* the hint speaks to the input at hand: keys and a pointer, or a finger */
.game-hud__hint-touch { display: none; }
@media (hover: none) {
	.game-hud__hint-pointer { display: none; }
	.game-hud__hint-touch { display: inline; }
}

/* ---------- the SD-08 toast ---------- */
.game-toast {
	position: fixed;
	z-index: 40;
	inset-block-end: clamp(76px, 13vh, 128px);
	inset-inline: 0;
	margin-inline: auto;
	inline-size: min(28rem, calc(100% - 2 * var(--sd-gutter)));
	padding-block: 14px;
	padding-inline: 18px;
	background: var(--sd-glass-strong);
	backdrop-filter: blur(14px);
	border: 1px solid var(--sd-gold);
	border-radius: 10px;
	box-shadow: var(--sd-shadow-panel);
	pointer-events: none;
	opacity: 0;
	transform: translateY(20px);
	transition: opacity var(--sd-dur) var(--sd-ease), transform var(--sd-dur) var(--sd-ease);
}

.game-toast.is-on {
	opacity: 1;
	transform: none;
}

.game-toast strong {
	display: block;
	font-family: var(--sd-font-display);
	font-weight: 400;
	font-size: 1.2rem;
	color: var(--sd-gold-hot);
}

.game-toast span {
	display: block;
	font-size: 0.95rem;
	color: var(--sd-text);
}

/* ---------- the game-over card: an arch panel in a native modal dialog ---------- */
.game-over {
	/* wide enough for the leaderboard; tall cards scroll inside the viewport */
	inline-size: min(28rem, calc(100% - 2 * var(--sd-gutter)));
	max-block-size: calc(100dvh - 2 * var(--sd-space-4));
	overflow-y: auto;
	max-inline-size: none;
	padding: 0;
	color: var(--sd-text);
	background: none;
	border: 0;
}

.game-over::backdrop {
	background: rgb(12 14 24 / 0.35);
}

.game-over__card {
	inline-size: 100%;
	padding-block: 3.6rem 1.8rem;
	text-align: center;
}

.game-over__card h2 {
	margin-block-end: var(--sd-space-2);
}

.game-over__card p {
	margin-block-end: var(--sd-space-5);
	color: var(--sd-text-dim);
}

.game-over__actions {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: var(--sd-space-2);
}
</style>

