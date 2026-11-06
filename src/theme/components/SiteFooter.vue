<script setup lang="ts">
/** Site footer: a limestone cornice line, credit and copyright. Strings come in as props. */
defineProps<{
	credit: string;
	copyright: string;
}>();
</script>

<template>
	<footer class="sd-footer">
		<p>{{ credit }}</p>
		<p class="sd-footer__copy">{{ copyright }}</p>
	</footer>
</template>

<style scoped>
.sd-footer {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	gap: var(--sd-space-2) var(--sd-space-5);
	margin-block-start: var(--sd-space-8);
	padding-block: var(--sd-space-5);
	padding-inline: var(--sd-gutter);
	border-block-start: 1px solid var(--sd-line);
	font-size: var(--sd-text-sm);
	color: var(--sd-text-dim);
}

.sd-footer__copy {
	font-variant-numeric: tabular-nums;
}
</style>

