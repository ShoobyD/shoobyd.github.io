<script setup lang="ts">
/** The code tier's projects: each one a doorway, lit when hovered or focused. */
import type { ProjectStatus } from '../../data/projects';

export interface ProjectItem {
	id: string;
	name: string;
	href?: string;
	status: ProjectStatus;
	statusLabel: string;
	description: string;
}

defineProps<{ items: ProjectItem[] }>();
</script>

<template>
	<ul class="projects">
		<li v-for="item in items" :key="item.id">
			<component
				:is="item.href ? 'a' : 'div'"
				class="project"
				:class="`project--${item.status}`"
				:href="item.href"
				:data-project="item.id"
			>
				<span class="project__door" aria-hidden="true" />
				<bdi class="project__name">{{ item.name }}</bdi>
				<span class="project__desc">{{ item.description }}</span>
				<span class="project__status">{{ item.statusLabel }}</span>
			</component>
		</li>
	</ul>
</template>

<style scoped>
.projects {
	display: grid;
	gap: 10px;
	margin: 0;
	margin-block-start: var(--sd-space-5);
	padding: 0;
	list-style: none;
}

.project {
	display: grid;
	grid-template-columns: auto 1fr auto;
	align-items: center;
	gap: 4px 14px;
	padding-block: 12px;
	padding-inline: 14px;
	color: inherit;
	text-decoration: none;
	background: rgb(255 240 215 / 0.03);
	border: 1px solid rgb(233 227 211 / 0.14);
	border-start-start-radius: var(--sd-arch-small);
	border-start-end-radius: var(--sd-arch-small);
	border-end-start-radius: var(--sd-corner);
	border-end-end-radius: var(--sd-corner);
	transition:
		background var(--sd-dur-fast),
		border-color var(--sd-dur-fast),
		transform var(--sd-dur) var(--sd-ease);
}

.project__door {
	grid-row: span 2;
	inline-size: 26px;
	block-size: 34px;
	background: #1e1b18;
	border: 2px solid rgb(233 227 211 / 0.5);
	border-radius: 13px 13px 2px 2px;
	transition: background var(--sd-dur-fast), border-color var(--sd-dur-fast);
}

.project__name {
	font-family: var(--sd-font-display);
	font-size: 1.22rem;
	line-height: 1.15;
}

.project__desc {
	grid-column: 2;
	font-size: 0.93rem;
	line-height: 1.35;
	color: var(--sd-text-dim);
}

.project__status {
	grid-row: 1 / span 2;
	grid-column: 3;
	padding-block: 4px;
	padding-inline: 10px;
	border: 1px solid currentColor;
	border-radius: var(--sd-pill);
	font-size: var(--sd-text-xs);
	font-weight: 700;
	letter-spacing: 0.04em;
	white-space: nowrap;
}

.project--live .project__status { color: var(--sd-gold); }
.project--archive .project__status,
.project--closed .project__status { color: var(--sd-text-dim); }

/* a closed project has no doorway to walk through */
.project--closed .project__door {
	background: repeating-linear-gradient(0deg, var(--sd-ochre-deep) 0 5px, #8a5b2c 5px 7px);
	border-color: rgb(233 227 211 / 0.25);
}

/* `is-lit` is set by the 3D tower while the visitor hovers this project's doorway in the wall,
 * or while the scroll is at its stop on the code tier */
a.project:hover,
a.project:focus-visible,
a.project.is-lit {
	background: rgb(242 195 126 / 0.12);
	border-color: rgb(242 195 126 / 0.6);
	transform: translateY(-2px);
}

a.project:hover .project__door,
a.project:focus-visible .project__door,
a.project.is-lit .project__door {
	background: radial-gradient(circle at 50% 70%, #fff1c9, #ffb35c 55%, #c46a22);
	border-color: var(--sd-limestone);
}

/* a closed project has no light behind its bricked doorway: its stop only marks the card */
div.project.is-lit {
	background: rgb(255 240 215 / 0.06);
	border-color: rgb(233 227 211 / 0.45);
}

@media (max-width: 30rem) {
	.project {
		padding-block: 10px;
		gap: 2px 12px;
	}
}
</style>

