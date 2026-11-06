<script setup lang="ts">
/**
 * The tower's content container: an arch-topped panel of dark glass with a limestone
 * keystone. Used for every tier on the home page and for inner pages.
 */
withDefaults(defineProps<{ as?: string }>(), { as: 'section' });
</script>

<template>
	<component :is="as" class="sd-arch-panel">
		<slot />
	</component>
</template>

<style scoped>
.sd-arch-panel {
	position: relative;
	inline-size: min(31rem, 100%);
	padding-block: 4.4rem 2rem;
	padding-inline: 2.1rem;
	background: linear-gradient(180deg, var(--sd-glass), var(--sd-glass-strong));
	backdrop-filter: blur(16px) saturate(1.15);
	border: 1px solid var(--sd-line);
	border-start-start-radius: var(--sd-arch);
	border-start-end-radius: var(--sd-arch);
	border-end-start-radius: var(--sd-corner);
	border-end-end-radius: var(--sd-corner);
	box-shadow: var(--sd-shadow-panel);
}

/* the keystone at the crown of the arch */
.sd-arch-panel::before {
	content: "";
	position: absolute;
	inset-block-start: -1px;
	inset-inline: 0;
	margin-inline: auto;
	inline-size: 26px;
	block-size: 20px;
	background: var(--sd-limestone);
	opacity: 0.85;
	clip-path: polygon(0 0, 100% 0, 78% 100%, 22% 100%);
}

@media (max-width: 30rem) {
	.sd-arch-panel {
		padding-block: 3.6rem 1.6rem;
		padding-inline: 1.4rem;
		--sd-arch: 50% 3.6rem;
	}
}
</style>

