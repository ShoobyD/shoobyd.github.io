<script setup lang="ts">
/**
 * Site header: brand on the inline-start, actions on the inline-end.
 * Content-agnostic: every string and URL comes in as a prop, so sibling repos can
 * render it with their own copy. Pages add extra actions through the `actions` slot.
 *
 * Each link's accessible name starts with the text it shows (so a voice command that says what is
 * on screen reaches it), followed by what it does, for screen readers only.
 */
import BrandMark from './BrandMark.vue';

export interface LangSwitch {
	href: string;
	label: string; // e.g. "EN"
	hint: string;  // e.g. "Switch to English" (read after the label)
	hreflang: string;  // e.g. "en"
}

defineProps<{
	homeHref: string;
	brandName: string;
	brandTagline: string;
	/** What the brand link does (e.g. "Home"), read after its name. */
	homeLabel: string;
	langSwitch?: LangSwitch;
}>();
</script>

<template>
	<header class="sd-header">
		<a class="sd-header__brand" :href="homeHref">
			<BrandMark />
			<span>
				<b class="sd-header__name">{{ brandName }}</b>
				<small class="sd-header__tagline">{{ brandTagline }}</small>
			</span>
			<span class="sd-visually-hidden">{{ homeLabel }}</span>
		</a>
		<div class="sd-header__actions">
			<slot name="actions" />
			<a
				v-if="langSwitch"
				class="sd-header__lang sd-control sd-control--display"
				:href="langSwitch.href"
				:hreflang="langSwitch.hreflang"
				:lang="langSwitch.hreflang"
			>{{ langSwitch.label }}<span class="sd-visually-hidden">{{ langSwitch.hint }}</span></a>
		</div>
	</header>
</template>

<style scoped>
.sd-header {
	position: relative;
	z-index: 20;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--sd-space-3);
	padding-block: clamp(12px, 2.2vw, 22px);
	padding-inline: var(--sd-gutter);
}

.sd-header__brand {
	display: flex;
	align-items: center;
	gap: var(--sd-space-3);
	text-decoration: none;
	border-radius: var(--sd-corner);
}

.sd-header__name {
	display: block;
	font-family: var(--sd-font-display);
	font-weight: 400;
	font-size: 1.32rem;
	line-height: 1;
	letter-spacing: 0.01em;
	text-shadow: var(--sd-shadow-text);
}

.sd-header__tagline {
	display: block;
	margin-block-start: 3px;
	font-size: var(--sd-text-xs);
	letter-spacing: 0.03em;
	text-shadow: var(--sd-shadow-text);
}

.sd-header__actions {
	display: flex;
	gap: var(--sd-space-2);
}

/* the pill control itself lives in base.css (.sd-control), so slotted page content gets it too */
</style>

