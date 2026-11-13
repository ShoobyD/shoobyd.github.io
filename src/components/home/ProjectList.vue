<script setup lang="ts">
/**
 * The code tier's projects: each one a doorway, lit when hovered or focused. Once the climb steps
 * through them (../tower/scene/projects.ts sets `data-stepping`) only the one in focus is open, its
 * description and status shown; the others close to a row of their name and a dot in their status's
 * colour. Without it every card stays open.
 */
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
				:target="item.href ? '_blank' : undefined"
				:rel="item.href ? 'noopener' : undefined"
				:data-project="item.id"
			>
				<span class="project__door" aria-hidden="true" />
				<bdi class="project__name">{{ item.name }}</bdi>
				<span class="project__more"><span class="project__desc">{{ item.description }}</span></span>
				<!-- closed, only its dot shows: the label stays for assistive tech, the title for the pointer -->
				<span class="project__status" :title="item.statusLabel">
					<span class="project__dot" aria-hidden="true" />
					<span class="project__label">{{ item.statusLabel }}</span>
				</span>
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

/* the description opens and closes as a grid row (0fr to 1fr), so it slides rather than jumps */
.project__more {
	grid-column: 2;
	display: grid;
	grid-template-rows: 1fr;
}

.project__desc {
	min-block-size: 0;
	overflow: hidden;
	font-size: 0.93rem;
	line-height: 1.35;
	color: var(--sd-text-dim);
}

/* each status its own colour: live in the lamplight's gold, in development in the sky's, archived grey */
.project { --status: var(--sd-text-dim); }
.project--live { --status: var(--sd-gold); }
.project--dev { --status: var(--sd-sky-pale); }

.project__status {
	grid-row: 1 / span 2;
	grid-column: 3;
	display: flex;
	align-items: center;
	gap: 6px;
	padding-block: 4px;
	padding-inline: 8px 10px;
	color: var(--status);
	border: 1px solid currentColor;
	border-radius: var(--sd-pill);
	font-size: var(--sd-text-xs);
	font-weight: 700;
	letter-spacing: 0.04em;
	white-space: nowrap;
}

.project__dot {
	flex: none;
	inline-size: 7px;
	block-size: 7px;
	background: currentColor;
	border-radius: 50%;
}

.project__label {
	overflow: hidden;
}

/* a project in development has no doorway to walk through yet */
.project--dev .project__door {
	background: repeating-linear-gradient(0deg, var(--sd-ochre-deep) 0 5px, #8a5b2c 5px 7px);
	border-color: rgb(233 227 211 / 0.25);
}

/* `is-lit` is set by the climb (../tower/scene/projects.ts) while the visitor hovers this
 * project's doorway in the wall, or while the scroll is at its stop on the code tier */
a.project:hover,
a.project:focus-visible,
a.project.is-lit {
	background: color-mix(in srgb, var(--sd-gold) 12%, transparent);
	border-color: color-mix(in srgb, var(--sd-gold) 60%, transparent);
	transform: translateY(-2px);
}

a.project:hover .project__door,
a.project:focus-visible .project__door,
a.project.is-lit .project__door {
	background: radial-gradient(circle at 50% 70%, #fff1c9, #ffb35c 55%, #c46a22);
	border-color: var(--sd-limestone);
}

/* on the lit card's warmer glass the dim description would fade: it takes the full text colour */
a.project:hover .project__desc,
a.project:focus-visible .project__desc,
a.project.is-lit .project__desc {
	color: var(--sd-text);
}

/* a project in development has no light behind its bricked doorway: its stop only marks the card */
div.project.is-lit {
	background: rgb(255 240 215 / 0.06);
	border-color: rgb(233 227 211 / 0.45);
}

/* stepping: the project in focus (lit) opens, a little larger; the others close to their name and
 * the dot of their status, which opens back into its pill with the card. Every part moves together,
 * on one gentle ease in and out (the site's sharp ease-out would do most of it in the first frames,
 * which reads as a jump), and nothing changes its place in the grid, only its size. */
.projects[data-stepping] {
	--step: 460ms cubic-bezier(0.45, 0, 0.2, 1);
}
.projects[data-stepping] .project {
	transition:
		background var(--step),
		border-color var(--step),
		transform var(--step),
		padding var(--step);
}
.projects[data-stepping] .project:not(.is-lit) {
	padding-block: 8px;
}
.projects[data-stepping] .project.is-lit {
	padding-block: 16px;
}
.projects[data-stepping] .project__door {
	align-self: center;
	inline-size: 20px;
	block-size: 26px;
	border-radius: 10px 10px 2px 2px;
	transition:
		background var(--step),
		border-color var(--step),
		inline-size var(--step),
		block-size var(--step),
		border-radius var(--step);
}
.projects[data-stepping] .project.is-lit .project__door {
	inline-size: 30px;
	block-size: 40px;
	border-radius: 15px 15px 2px 2px;
}
.projects[data-stepping] .project__name {
	transition: font-size var(--step);
}
.projects[data-stepping] .project.is-lit .project__name {
	font-size: 1.32rem;
}
.projects[data-stepping] .project__more {
	grid-template-rows: 0fr;
	opacity: 0;
	transition: grid-template-rows var(--step), opacity var(--step);
}
.projects[data-stepping] .project.is-lit .project__more {
	grid-template-rows: 1fr;
	opacity: 1;
}
.projects[data-stepping] .project__status {
	align-self: center;
	transition: gap var(--step), padding var(--step), border-color var(--step);
}
.projects[data-stepping] .project:not(.is-lit) .project__status {
	gap: 0;
	padding-inline: 0;
	border-color: transparent;
}
.projects[data-stepping] .project__label {
	max-inline-size: 8em;
	transition: max-inline-size var(--step), opacity var(--step);
}
.projects[data-stepping] .project:not(.is-lit) .project__label {
	max-inline-size: 0;
	opacity: 0;
}
.projects[data-stepping] .project__dot {
	transition: inline-size var(--step), block-size var(--step), box-shadow var(--step);
}
.projects[data-stepping] .project:not(.is-lit) .project__dot {
	inline-size: 8px;
	block-size: 8px;
	box-shadow: 0 0 0 3px color-mix(in srgb, var(--status) 20%, transparent);
}

/* while projects.ts measures its states, and with reduced motion, nothing slides or grows */
.projects.is-measuring,
.projects.is-measuring * {
	transition: none !important;
}
@media (prefers-reduced-motion: reduce) {
	.projects[data-stepping] .project,
	.projects[data-stepping] .project__door,
	.projects[data-stepping] .project__name,
	.projects[data-stepping] .project__more,
	.projects[data-stepping] .project__status,
	.projects[data-stepping] .project__label,
	.projects[data-stepping] .project__dot {
		transition: none;
	}
}

@media (max-width: 30rem) {
	.project {
		padding-block: 10px;
		gap: 2px 12px;
	}
}
</style>

