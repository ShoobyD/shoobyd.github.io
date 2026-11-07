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
	/** Accessible name of the sheet handle (narrow screens open and close the panel with it). */
	sheetLabel: string;
}>();
</script>

<template>
	<section :id="`tier-${id}`" class="tier" :class="tone && `tier--${tone}`" :aria-labelledby="`tier-${id}-title`">
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
			<slot />
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
		padding-inline: var(--sd-gutter) calc(var(--sd-gutter) + 2.5rem);
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

html.webgl .tier__panel {
	position: fixed;
	z-index: 6;
	inset-inline-start: clamp(16px, 6vw, 112px);
	inset-block: 0;
	margin-block: auto;
	block-size: fit-content;
	max-block-size: calc(100vh - 150px);
	inline-size: min(31rem, 40vw);
	overflow: auto;
	overscroll-behavior: contain;
	scrollbar-width: thin;
	opacity: 0;
	pointer-events: none;
	will-change: opacity, transform;
}

html.webgl .tier__panel.is-on {
	pointer-events: auto;
}

/* narrow screens: the panel docks along the bottom edge and the tower rises above it */
@media (max-width: 47.5rem) {
	html.webgl .tier__panel {
		inset-inline: 12px;
		inset-block: auto 12px;
		margin-block: 0;
		inline-size: auto;
		max-block-size: 50vh;
		padding-block: 2.7rem 1.3rem;
		padding-inline: 1.3rem;
		border-start-start-radius: 50% 2.6rem;
		border-start-end-radius: 50% 2.6rem;
	}
}
</style>

