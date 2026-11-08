<script setup lang="ts">
/**
 * The shared leaderboard on the game-over card: the top ten "tower builders", and when a run
 * makes the board, a name field to carve it in. The board is loaded when the run ends; when the
 * service can't be reached, a quiet note replaces it and the game carries on as before.
 *
 * The server has the final word (it checks the name, whether the run was possible, and the board
 * as it stands); this component only predicts whether to offer the field, and shows the answer.
 */
import { computed, nextTick, ref, watch } from 'vue';
import { countBricks, type BoardCopy, type BrickCount } from '../../i18n/home';
import {
	BOARD_SIZE,
	NAME_MAX,
	fetchBoard,
	makesBoard,
	rememberName,
	rememberedName,
	slotFor,
	submitScore,
	type BoardEntry,
} from './leaderboard';

const props = defineProps<{
	copy: BoardCopy;
	/** How a number of bricks reads ("one brick" / "12 bricks"). */
	count: BrickCount;
	/** Bricks laid in the run that just ended. */
	score: number;
	durationMs: number;
	/** Bumped for every finished run, so the board reloads and the form starts fresh. */
	run: number;
}>();

const emit = defineEmits<{
	announce: [text: string];
	/** The name was carved in and the form is gone: the card moves focus on (to "again"). */
	added: [];
}>();

type Status = 'loading' | 'ready' | 'unavailable';

const status = ref<Status>('loading');
const board = ref<BoardEntry[]>([]);
const name = ref('');
const submitting = ref(false);
const error = ref('');
const addedId = ref<number | null>(null);
const addedRank = ref(0);
const input = ref<HTMLInputElement | null>(null);

const fill = (s: string, values: Record<string, string | number>) =>
	s.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));

const canJoin = computed(() => status.value === 'ready' && addedId.value === null && makesBoard(board.value, props.score));

/** The rows to show: the board, with an empty "your spot" row while the name is being written. */
const rows = computed(() => {
	const list = board.value.map((e) => ({ key: String(e.id), name: e.name, score: e.score, you: e.id === addedId.value, slot: false }));
	if (canJoin.value) {
		list.splice(slotFor(board.value, props.score), 0, { key: 'slot', name: props.copy.yourSpot, score: props.score, you: true, slot: true });
	}
	return list.slice(0, BOARD_SIZE);
});

/** How far a run that missed the board fell short of it (only once the board is full). */
const shortBy = computed(() => {
	if (status.value !== 'ready' || canJoin.value || addedId.value !== null || board.value.length < BOARD_SIZE) return null;
	const min = board.value[BOARD_SIZE - 1].score + 1;
	return { min: countBricks(props.count, min), missing: countBricks(props.copy.shortBy, Math.max(1, min - props.score)) };
});

async function load() {
	status.value = 'loading';
	addedId.value = null;
	error.value = '';
	name.value = rememberedName();
	const run = props.run;
	const scores = await fetchBoard();
	if (run !== props.run) return; // a newer run took over while this one loaded
	if (!scores) {
		status.value = 'unavailable';
		return;
	}
	board.value = scores;
	status.value = 'ready';
	if (canJoin.value) {
		emit('announce', props.copy.qualifies);
		await nextTick();
		// usually the card isn't up yet and focuses the field itself when it opens; if the board was
		// slower than the card, take focus only if the player hasn't moved on from "again"
		const focused = document.activeElement;
		if (input.value?.closest('dialog[open]') && (!focused || focused === document.body || focused.closest('.game-over__actions'))) {
			input.value.focus();
		}
	}
}

async function submit() {
	if (submitting.value) return;
	error.value = '';
	const trimmed = name.value.trim();
	if (!trimmed) {
		error.value = props.copy.errors.name_empty;
		input.value?.focus();
		return;
	}
	submitting.value = true;
	const result = await submitScore({ name: trimmed, score: props.score, durationMs: props.durationMs });
	submitting.value = false;
	if (!result) {
		error.value = props.copy.errors.network;
		emit('announce', error.value);
		return;
	}
	board.value = result.scores;
	if (result.accepted) {
		rememberName(trimmed);
		addedId.value = result.id;
		addedRank.value = result.rank;
		emit('announce', fill(props.copy.added, { n: result.rank }));
		await nextTick();
		emit('added');
		return;
	}
	error.value = props.copy.errors[result.reason] ?? props.copy.errors.network;
	emit('announce', error.value);
	// a name problem keeps the field; anything else (the board moved, too many tries) ends the form
	if (result.reason.startsWith('name_')) input.value?.focus();
}

watch(() => props.run, load, { immediate: true });
</script>

<template>
	<div class="board">
		<p v-if="status === 'loading'" class="board__note">{{ copy.loading }}</p>
		<p v-else-if="status === 'unavailable'" class="board__note">{{ copy.unavailable }}</p>

		<template v-else>
			<p v-if="addedId !== null" class="board__lead">{{ fill(copy.added, { n: addedRank }) }}</p>

			<form v-else-if="canJoin" class="board__form" novalidate @submit.prevent="submit">
				<p class="board__lead">{{ copy.qualifies }}</p>
				<label class="board__label" for="board-name">{{ copy.nameLabel }}</label>
				<input
					id="board-name"
					ref="input"
					v-model="name"
					class="board__input"
					type="text"
					:maxlength="NAME_MAX"
					:placeholder="copy.namePlaceholder"
					autocomplete="nickname"
					enterkeyhint="done"
					:aria-invalid="error ? 'true' : undefined"
					:aria-describedby="error ? 'board-error' : undefined"
				/>
				<button class="sd-control sd-control--gold" type="submit" :disabled="submitting">
					{{ submitting ? copy.submitting : copy.submit }}
				</button>
				<p v-if="error" id="board-error" class="board__error">{{ error }}</p>
			</form>

			<p v-else-if="error" class="board__error">{{ error }}</p>

			<section v-if="rows.length" class="board__table" aria-labelledby="board-title">
				<h3 id="board-title" class="board__title">{{ copy.title }}</h3>
				<ol class="board__list">
					<li
						v-for="(row, i) in rows"
						:key="row.key"
						class="board__row"
						:class="{ 'is-you': row.you, 'is-slot': row.slot, 'is-top': i < 3 }"
						:aria-current="row.you && !row.slot ? 'true' : undefined"
					>
						<span class="sd-visually-hidden">{{ fill(copy.rowLabel, { rank: i + 1, name: row.name, score: countBricks(count, row.score) }) }}</span>
						<span class="board__rank" aria-hidden="true">{{ i + 1 }}</span>
						<!-- the cell keeps the page's direction; <bdi> isolates a name written in the other one -->
						<span class="board__name" aria-hidden="true"><bdi>{{ row.name }}</bdi></span>
						<span class="board__score" aria-hidden="true">{{ row.score }}</span>
					</li>
				</ol>
			</section>

			<p v-if="shortBy" class="board__note">{{ fill(copy.short, shortBy) }}</p>
		</template>
	</div>
</template>

<style scoped>
.board {
	margin-block: var(--sd-space-3) var(--sd-space-5);
	text-align: start;
}

.board__note,
.board__lead {
	margin: 0 0 var(--sd-space-3);
	font-size: var(--sd-text-sm);
	text-align: center;
	color: var(--sd-text-dim);
}

.board__lead {
	color: var(--sd-text);
}

.board__form {
	display: grid;
	grid-template-columns: 1fr auto;
	gap: var(--sd-space-2);
	margin-block-end: var(--sd-space-3);
}

.board__form .board__lead,
.board__label,
.board__error {
	grid-column: 1 / -1;
}

.board__label {
	font-size: 0.85rem;
	color: var(--sd-text-dim);
}

.board__input {
	min-block-size: 44px;
	min-inline-size: 0;
	padding-inline: 14px;
	background: rgb(255 240 215 / 0.06);
	color: var(--sd-text);
	border: 1px solid var(--sd-line-strong);
	border-radius: var(--sd-pill);
	font: inherit;
}

.board__input::placeholder {
	color: var(--sd-text-dim);
}

.board__input[aria-invalid='true'] {
	border-color: var(--sd-gold-hot);
}

.board__error {
	margin: 0;
	font-size: var(--sd-text-sm);
	color: var(--sd-gold-hot);
	text-align: center;
}

.board__title {
	margin-block-end: var(--sd-space-2);
	font-size: 1.15rem;
	color: var(--sd-gold);
	text-align: center;
}

.board__list {
	display: grid;
	gap: 2px;
	margin: 0;
	padding: 0;
	list-style: none;
}

.board__row {
	display: grid;
	grid-template-columns: 2rem 1fr auto;
	align-items: center;
	gap: var(--sd-space-3);
	padding-block: 5px;
	padding-inline: 10px;
	border-radius: var(--sd-corner);
	font-size: 0.95rem;
}

.board__row:nth-child(odd) {
	background: rgb(255 240 215 / 0.04);
}

.board__rank {
	font-family: var(--sd-font-display);
	font-variant-numeric: tabular-nums;
	text-align: center;
	color: var(--sd-text-dim);
}

.board__row.is-top .board__rank {
	color: var(--sd-gold);
}

.board__name {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.board__score {
	font-family: var(--sd-font-display);
	font-variant-numeric: tabular-nums;
}

.board__row.is-you {
	background: rgb(242 195 126 / 0.14);
	outline: 1px solid rgb(242 195 126 / 0.7);
}

.board__row.is-slot .board__name {
	font-style: italic;
	color: var(--sd-gold);
}
</style>

