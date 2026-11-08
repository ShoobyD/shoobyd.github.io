<script setup lang="ts">
/**
 * One tier of the tower: a full-height section holding one arch panel.
 * The section id is the anchor the altitude gauge links to.
 *
 * When the 3D tower is active (`html.webgl`), each section becomes a tall scroll span and its
 * panel is fixed over the canvas; the tower island fades each panel in around its own tier.
 * The heading's content can be replaced through the `title` slot (e.g. the summit's Babel joke).
 */
import ArchPanel from '../../theme/components/ArchPanel.vue';

defineProps<{
	id: string;
	title: string;
	/** The base tier carries the page's h1; every other tier is an h2. */
	level?: 1 | 2;
	/** Extra class on the section, for per-tier atmosphere (e.g. stars at the summit). */
	tone?: string;
	/**
	 * In the 3D climb, the number of stops the tier holds the climb for (e.g. one per project on
	 * the code tier): its scroll span grows by half a viewport per stop after the first, and the
	 * scroll steps through them before the climb moves on (see ../tower/mode.ts).
	 */
	stops?: number;
	/** Accessible name of the sheet handle (narrow screens open and close the panel with it). */
	sheetLabel: string;
}>();
</script>

<template>
	<section
		:id="`tier-${id}`"
		class="tier"
		:class="tone && `tier--${tone}`"
		:aria-labelledby="`tier-${id}-title`"
		:data-stops="stops"
		:style="stops ? { '--stops': stops } : undefined"
	>
		<ArchPanel as="article" class="tier__panel" data-tier-panel>
			<!-- the keystone, as the handle of the bottom sheet the panel becomes on narrow screens -->
			<button class="tier__sheet" type="button" :aria-label="sheetLabel" aria-expanded="true" data-sheet-handle>
				<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
					<path d="M5 9l7 7 7-7" />
				</svg>
			</button>
			<component :is="level === 1 ? 'h1' : 'h2'" :id="`tier-${id}-title`" class="tier__title">
				<slot name="title">{{ title }}</slot>
			</component>
			<!-- the panel's content under its title: on wide screens in 3D this is what scrolls when it
			     runs long, so the title stays in view and the scrollbar runs down the panel's straight
			     side, below the arch and the title -->
			<div class="tier__body">
				<slot />
			</div>
		</ArchPanel>
	</section>
</template>

<style scoped>
.tier {
	position: relative;
	min-block-size: 100vh;
	min-block-size: 100svh;
	display: flex;
	align-items: center;
	padding-block: var(--sd-space-8);
	/* the inline-end side is kept clear for the tower (6b) and the altitude gauge */
	padding-inline: var(--sd-gutter) calc(var(--sd-gutter) + 9rem);
	scroll-margin-block-start: 0;
}

.tier__title {
	margin-block-end: var(--sd-space-3);
}

h2.tier__title {
	margin-block-end: var(--sd-space-4);
}

/* the sheet handle: a larger keystone carrying a chevron that points where the sheet will go
 * (down while open, up while collapsed). Shown only where the panel is a sheet. */
.tier__sheet {
	display: none;
	position: absolute;
	z-index: 1;
	inset-block-start: -1px;
	inset-inline: 0;
	margin-inline: auto;
	inline-size: 44px;
	block-size: 30px;
	padding: 0;
	place-items: center;
	color: var(--sd-ink);
	background: var(--sd-limestone);
	border: 0;
	clip-path: polygon(0 0, 100% 0, 80% 100%, 20% 100%);
	cursor: pointer;
	touch-action: none;
}

.tier__sheet svg {
	inline-size: 14px;
	block-size: 14px;
	margin-block-start: -3px;
	fill: none;
	stroke: currentColor;
	stroke-width: 3.2;
	stroke-linecap: round;
	stroke-linejoin: round;
	transition: rotate var(--sd-dur) var(--sd-ease);
}

.tier__sheet[aria-expanded="false"] svg {
	rotate: 180deg;
}

.tier__sheet:focus-visible {
	outline: 2px solid var(--sd-focus);
	outline-offset: 2px;
	clip-path: none;
}

@media (max-width: 47.5rem) {
	.tier {
		padding-block: 6rem var(--sd-space-7);
		/* room on the inline-end for the altitude gauge's marks (only the current tier is named) */
		padding-inline: var(--sd-gutter) calc(var(--sd-gutter) + 1.9rem);
	}
}

/* ---------- 3D mode: the climb ----------
 * Each tier is a 1.5-viewport scroll span (the summit just one); the camera parks when a
 * section's top meets the viewport's. Panels are fixed at the inline-start, clear of the tower. */
html.webgl .tier {
	block-size: 150vh;
	min-block-size: 0;
	padding: 0;
}

html.webgl .tier:last-of-type {
	block-size: 100vh;
}

/* a tier with stops holds the climb: half a viewport more per stop after the first */
html.webgl .tier[data-stops] {
	block-size: calc(150vh + (var(--stops) - 1) * 50vh);
}

html.webgl .tier__panel {
	position: fixed;
	z-index: 6;
	inset-inline-start: clamp(16px, 6vw, 112px);
	inset-block: 0;
	margin-block: auto;
	block-size: fit-content;
	max-block-size: calc(100vh - 150px);
	inline-size: min(31rem, 40vw);
	display: flex;
	flex-direction: column;
	overflow: hidden;
	opacity: 0;
	pointer-events: none;
	will-change: opacity, transform;
}

/* a panel taller than the window scrolls its content under the title, not itself: the title stays
 * in view, and the scrollbar stays inside the panel, by its straight side, rather than running up
 * past the arch (the negative margin and matching padding put it near the edge, clear of the text) */
html.webgl .tier__body {
	flex: 1 1 auto;
	min-block-size: 0;
	/* only up and down; a tilted picture's corner (the self-portrait hangs askew) mustn't make it
	 * scroll either way, so a few pixels of room below take it in */
	overflow: hidden auto;
	overscroll-behavior: contain;
	scrollbar-width: thin;
	margin-inline-end: -1.3rem;
	padding-inline-end: 1.3rem;
	margin-block-end: -8px;
	padding-block-end: 8px;
	/* soft edges where it scrolls: at the top once scrolled (the content slips under the title), at
	 * the bottom while there is more below; the climb sets them (scene/climb.ts) */
	mask-image: linear-gradient(to bottom, transparent, #000 var(--fade-top), #000 calc(100% - var(--fade-bottom)), transparent);
	transition: --fade-top var(--sd-dur-fast), --fade-bottom var(--sd-dur-fast);
}

@property --fade-top {
	syntax: "<length>";
	inherits: false;
	initial-value: 0px;
}

@property --fade-bottom {
	syntax: "<length>";
	inherits: false;
	initial-value: 0px;
}

html.webgl .tier__panel.is-on {
	pointer-events: auto;
}

/* narrow screens: the panel is a bottom sheet (../tower/scene/sheet.ts keeps its state). Open,
 * it rises to just under the header; collapsed, it slides down until only its peek (the title
 * and the start of the next lines, fading out) is left above the bottom edge, and the tower
 * has the screen. It moves with `translate`, which composes with the climb's `transform`. */
@property --sheet-fade {
	syntax: "<length>";
	inherits: false;
	initial-value: 0px;
}

@media (max-width: 47.5rem) {
	/* the sheet scrolls itself (sheet.ts reads and resets its scroll), its content doesn't */
	html.webgl .tier__panel {
		display: block;
		overflow: auto;
		overscroll-behavior: contain;
		scrollbar-width: thin;
		--sheet-fade: 100vh;
		inset-inline: 8px;
		/* resting on the site footer when it scrolls into view (sheet.ts) */
		inset-block: auto var(--sheet-bottom, 0px);
		margin-block: 0;
		inline-size: auto;
		max-block-size: calc(100svh - var(--sheet-top, 72px) - var(--sheet-bottom, 0px));
		padding-block: 2.9rem 1.3rem;
		padding-inline: 1.3rem;
		border-start-start-radius: 50% 2.6rem;
		border-start-end-radius: 50% 2.6rem;
		border-end-start-radius: 0;
		border-end-end-radius: 0;
		border-block-end: 0;
		mask-image: linear-gradient(
			to bottom,
			#000 calc(var(--sheet-peek, 150px) - 2.6rem + var(--sheet-fade)),
			transparent calc(var(--sheet-peek, 150px) - 0.2rem + var(--sheet-fade))
		);
		transition:
			translate 420ms var(--sd-ease),
			--sheet-fade 420ms var(--sd-ease);
	}

	html.webgl .tier__body {
		overflow: visible;
		margin-inline-end: 0;
		padding-inline-end: 0;
		margin-block-end: 0;
		padding-block-end: 0;
		mask-image: none;
	}

	html.webgl .tier__panel.is-sheet-collapsed {
		--sheet-fade: 0px;
		translate: 0 calc(100% - var(--sheet-peek, 150px));
		overflow: hidden;
	}

	/* under a finger the sheet follows it exactly (an inline translate) and shows all it holds */
	html.webgl .tier__panel.is-sheet-dragging {
		--sheet-fade: 100vh;
		transition: none;
	}

	/* the handle takes the keystone's place */
	html.webgl .tier__panel::before {
		display: none;
	}

	html.webgl .tier__sheet {
		display: grid;
	}
}
</style>

