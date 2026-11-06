<script setup lang="ts">
/** The ShoobyD mark: a four-tier tower with scaffolding at the unfinished top. */
withDefaults(defineProps<{ size?: number }>(), { size: 30 });
</script>

<template>
	<svg
		class="sd-brand-mark"
		:width="size"
		:height="Math.round(size * 34 / 30)"
		viewBox="0 0 30 34"
		aria-hidden="true"
		focusable="false"
	>
		<path d="M3 33h24l-2-6H5zM6 26h18l-2-6H8zM9 19h12l-1.6-6h-8.8zM11.5 12h7l-1.2-5h-4.6z" fill="var(--sd-ochre)" />
		<path d="M3 33h24M6 26h18M9 19h12M11.5 12h7" stroke="var(--sd-limestone)" stroke-width="1.4" />
		<path d="M14 7V2M16 7V3.5M12.5 4.5h5" stroke="var(--sd-limestone)" stroke-width="1.2" stroke-linecap="round" />
	</svg>
</template>

<style scoped>
.sd-brand-mark {
	flex: none;
	filter: drop-shadow(0 2px 6px rgb(0 0 0 / 0.35));
}
</style>

