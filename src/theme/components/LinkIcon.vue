<script setup lang="ts">
/**
 * A contact or profile icon (see ../link-icons.ts), drawn in the current text colour.
 * Decorative: the link's own text names it, so the icon is hidden from screen readers.
 */
import { LINK_ICONS, type LinkIconName } from '../link-icons';

withDefaults(defineProps<{ name: LinkIconName; size?: number }>(), { size: 20 });
</script>

<template>
	<svg
		class="sd-link-icon"
		:width="size"
		:height="size"
		viewBox="0 0 24 24"
		fill="currentColor"
		fill-rule="evenodd"
		aria-hidden="true"
		focusable="false"
	>
		<path :d="LINK_ICONS[name]" />
	</svg>
</template>

<style scoped>
.sd-link-icon {
	flex: none;
}
</style>

