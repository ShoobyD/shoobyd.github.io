<script setup lang="ts">
/**
 * One tier of the tower: a full-height section holding one arch panel.
 * The section id is the anchor the altitude gauge links to.
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
		<ArchPanel as="article">
			<component :is="level === 1 ? 'h1' : 'h2'" :id="`tier-${id}-title`" class="tier__title">{{ title }}</component>
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
</style>

