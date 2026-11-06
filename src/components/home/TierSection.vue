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
}>();
</script>

<template>
	<section :id="`tier-${id}`" class="tier" :class="tone && `tier--${tone}`" :aria-labelledby="`tier-${id}-title`">
		<ArchPanel as="article" class="tier__panel" data-tier-panel>
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

