<script setup lang="ts">
/** The summit's contact links: a gold icon and label, and the handle itself. */
import LinkIcon from '../../theme/components/LinkIcon.vue';
import type { LinkIconName } from '../../theme/link-icons';

export interface ContactItem {
	id: string;
	label: string;
	value: string;
	href: string;
	external?: boolean;
	icon?: LinkIconName;
	/** Marks the link for a viewer that may open it in place (e.g. `cv`, see CvViewer.astro). */
	opens?: string;
}

defineProps<{ items: ContactItem[] }>();
</script>

<template>
	<ul class="contacts">
		<li v-for="item in items" :key="item.id">
			<a
				:href="item.href"
				:rel="item.external ? 'noopener' : undefined"
				:target="item.external ? '_blank' : undefined"
				:data-opens="item.opens"
			>
				<span class="contacts__label">
					<LinkIcon v-if="item.icon" :name="item.icon" :size="18" />
					{{ item.label }}
				</span>
				<bdi class="contacts__value">{{ item.value }}</bdi>
			</a>
		</li>
	</ul>
</template>

<style scoped>
.contacts {
	display: grid;
	gap: 8px;
	margin: 0;
	padding: 0;
	list-style: none;
}

.contacts a {
	display: flex;
	/* a handle too long for the row drops, whole, onto a line of its own under the label */
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 4px 12px;
	padding-block: 11px;
	padding-inline: 14px;
	text-decoration: none;
	background: rgb(255 240 215 / 0.04);
	border: 1px solid rgb(233 227 211 / 0.14);
	border-radius: 8px;
	transition: border-color var(--sd-dur-fast), background var(--sd-dur-fast);
}

.contacts a:hover,
.contacts a:focus-visible {
	border-color: rgb(242 195 126 / 0.65);
	background: rgb(242 195 126 / 0.1);
}

.contacts__label {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	font-size: 0.85rem;
	font-weight: 700;
	letter-spacing: 0.04em;
	color: var(--sd-gold);
}

.contacts__value {
	font-family: var(--sd-font-display);
	font-size: 1.08rem;
	/* broken only if it can't fit even on a line of its own */
	overflow-wrap: break-word;
	min-inline-size: 0;
}

/* narrow screens: a little tighter, so the open summit sheet holds them all on small phones
 * (the rows stay about 44px tall) */
@media (max-width: 47.5rem) {
	.contacts {
		gap: 6px;
	}
	.contacts a {
		padding-block: 8px;
	}
}
</style>

