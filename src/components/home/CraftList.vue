<script setup lang="ts">
/**
 * The making tier: hobbies, each with an authored line icon.
 * An item's text may contain one `{link}` token, rendered as a link to `href`.
 */
import { computed } from 'vue';

export type CraftIcon = 'guitar' | 'drawing' | 'cooking' | 'diy';

export interface CraftItem {
	icon: CraftIcon;
	text: string;
	link?: { label: string; href: string };
}

const props = defineProps<{ items: CraftItem[] }>();

const rows = computed(() =>
	props.items.map((item) => {
		const [before, after = ''] = item.text.split('{link}');
		return { ...item, before, after };
	}),
);
</script>

<template>
	<ul class="crafts">
		<li v-for="row in rows" :key="row.icon">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<template v-if="row.icon === 'guitar'">
					<path d="M13.5 10.5L21 3M18.5 2.5l3 3" />
					<path d="M11 9.5c-1.8-.9-4.4-.4-5.9 1.1-1 1-1 2.3-.4 3.1-1.7.2-2.9 1.6-2.7 3.4.3 2.2 2.3 4.2 4.5 4.5 1.8.2 3.2-1 3.4-2.7.8.6 2.1.6 3.1-.4 1.5-1.5 2-4.1 1.1-5.9" />
					<circle cx="9" cy="15" r="1.4" />
				</template>
				<template v-else-if="row.icon === 'drawing'">
					<path d="M20.5 3.5L11 13" />
					<path d="M11 13c-2-.3-4 1-4.3 3.3-.2 1.7-1.3 2.7-3.2 3.2 3 1.7 7.6 1.3 8.7-2.3.4-1.4.2-3-1.2-4.2z" />
				</template>
				<template v-else-if="row.icon === 'cooking'">
					<path d="M3 11h18M5 11v6a3 3 0 003 3h8a3 3 0 003-3v-6M1.5 11H3M21 11h1.5" />
					<path d="M9 7c0-1.5 1-1.5 1-3M13 7c0-1.5 1-1.5 1-3" />
				</template>
				<template v-else>
					<path d="M14 6l4 4M4 20l9-9" />
					<path d="M12 4.5l3-2 6.5 6.5-2 3-3.5-1-2-2z" />
				</template>
			</svg>
			<span>
				{{ row.before }}<a v-if="row.link" :href="row.link.href" rel="noopener" target="_blank">{{ row.link.label }}</a>{{ row.after }}
			</span>
		</li>
	</ul>
</template>

<style scoped>
.crafts {
	display: grid;
	gap: 4px;
	margin: 0;
	padding: 0;
	list-style: none;
}

.crafts li {
	display: flex;
	align-items: center;
	gap: 14px;
	padding-block: 9px;
	border-block-end: 1px solid rgb(233 227 211 / 0.1);
	font-size: 1.06rem;
}

.crafts li:last-child {
	border-block-end: 0;
}

.crafts svg {
	flex: none;
	inline-size: 26px;
	block-size: 26px;
	color: var(--sd-gold);
}
</style>

