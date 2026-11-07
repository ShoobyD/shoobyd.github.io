<script setup lang="ts">
/**
 * The altitude gauge: the home page's navigation, drawn as the tower's height scale.
 * Tiers are plain anchor links (they work without JavaScript, and in the 3D climb they land on
 * the tier's park); once hydrated, the gauge marks the tier in view and reads the current
 * altitude in cubits from the scroll position, in either layout.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { isTowerActive, progressAt, sectionTops } from '../tower/mode';

export interface GaugeTier {
	id: string;
	label: string;
	altitude: number;
}

const props = defineProps<{
	label: string;
	unit: string;
	tiers: GaugeTier[];
}>();

const current = ref(props.tiers[0]?.id ?? '');
const altitude = ref(0);

let frame = 0;
let sections: HTMLElement[] = [];
let layout: ResizeObserver | null = null;

/**
 * In the 3D climb a tier is reached when its (tall) section's top meets the viewport's top,
 * the same progress the camera and panels follow, so the gauge reads where the climb is going.
 */
function measureClimb() {
	const progress = progressAt(sectionTops(sections), window.scrollY);
	const i = Math.min(Math.floor(progress), props.tiers.length - 2);
	const t = progress - i;
	current.value = props.tiers[Math.round(progress)].id;
	altitude.value = Math.round(props.tiers[i].altitude + (props.tiers[i + 1].altitude - props.tiers[i].altitude) * t);
}

/**
 * On the static page a tier reads its exact altitude when its centre crosses the middle of the
 * viewport; between two centres the altitude is interpolated. The current tier is the nearest centre.
 */
function measure() {
	frame = 0;
	if (isTowerActive()) {
		measureClimb();
		return;
	}
	const probe = window.innerHeight * 0.5;
	const centres = sections.map((el) => {
		const r = el.getBoundingClientRect();
		return r.top + r.height / 2;
	});

	let nearest = 0;
	centres.forEach((c, i) => {
		if (Math.abs(c - probe) < Math.abs(centres[nearest] - probe)) nearest = i;
	});
	current.value = props.tiers[nearest].id;

	const last = centres.length - 1;
	let i = 0;
	while (i < last && centres[i + 1] <= probe) i++;
	const from = props.tiers[i].altitude;
	if (probe <= centres[0] || i === last) {
		altitude.value = probe <= centres[0] ? props.tiers[0].altitude : props.tiers[last].altitude;
		return;
	}
	const progress = (probe - centres[i]) / (centres[i + 1] - centres[i]);
	altitude.value = Math.round(from + (props.tiers[i + 1].altitude - from) * progress);
}

function schedule() {
	if (!frame) frame = requestAnimationFrame(measure);
}

onMounted(() => {
	sections = props.tiers
		.map((tier) => document.getElementById(`tier-${tier.id}`))
		.filter((el): el is HTMLElement => !!el);
	if (sections.length !== props.tiers.length) return;
	measure();
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule);
	// the page changes height when the 3D climb switches on or off
	layout = new ResizeObserver(schedule);
	layout.observe(document.body);
});

onBeforeUnmount(() => {
	window.removeEventListener('scroll', schedule);
	window.removeEventListener('resize', schedule);
	layout?.disconnect();
	cancelAnimationFrame(frame);
});
</script>

<template>
	<nav class="gauge" :aria-label="label" data-tower-chrome>
		<p class="gauge__altitude" aria-hidden="true">
			<b>{{ altitude }}</b>
			<span>{{ unit }}</span>
		</p>
		<ol class="gauge__tiers">
			<li v-for="tier in tiers" :key="tier.id">
				<a :href="`#tier-${tier.id}`" :aria-current="current === tier.id ? 'location' : undefined">
					<span class="gauge__label">{{ tier.label }}</span>
					<i class="gauge__mark" aria-hidden="true" />
				</a>
			</li>
		</ol>
	</nav>
</template>

<style scoped>
.gauge {
	position: fixed;
	z-index: 15;
	inset-inline-end: clamp(12px, 2.6vw, 40px);
	inset-block: 0;
	margin-block: auto;
	block-size: min(58vh, 470px);
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 14px;
}

.gauge__altitude {
	margin: 0;
	font-family: var(--sd-font-display);
	font-size: 0.95rem;
	line-height: 1.1;
	text-align: end;
	text-shadow: var(--sd-shadow-text);
	white-space: nowrap;
}

.gauge__altitude b {
	display: block;
	font-weight: 400;
	font-size: 1.5rem;
	font-variant-numeric: tabular-nums;
}

/* the scale runs bottom (base) to top (summit), so the list is laid out in reverse */
.gauge__tiers {
	position: relative;
	flex: 1;
	display: flex;
	flex-direction: column-reverse;
	justify-content: space-between;
	margin: 0;
	padding: 0;
	list-style: none;
}

.gauge__tiers::before {
	content: "";
	position: absolute;
	inset-block: 8px;
	inset-inline-end: 7px;
	inline-size: 2px;
	background: linear-gradient(to top, rgb(233 227 211 / 0.15), rgb(233 227 211 / 0.55));
	border-radius: 2px;
}

.gauge__tiers a {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 10px;
	padding-block: 4px;
	color: var(--sd-text);
	font-size: 0.86rem;
	font-weight: 600;
	text-decoration: none;
}

.gauge__label {
	padding-block: 2px;
	padding-inline: 8px;
	background: rgb(30 27 24 / 0.5);
	border-radius: var(--sd-pill);
	text-shadow: var(--sd-shadow-text);
	white-space: nowrap;
}

.gauge__mark {
	flex: none;
	inline-size: 16px;
	block-size: 16px;
	background: rgb(233 227 211 / 0.35);
	border: 2px solid rgb(30 27 24 / 0.6);
	border-radius: 3px 3px 1px 1px;
	transition: background var(--sd-dur-fast), transform var(--sd-dur-fast) var(--sd-ease);
}

.gauge__tiers a:hover .gauge__mark { background: var(--sd-limestone); }

.gauge__tiers a[aria-current] .gauge__label { background: var(--sd-glass-strong); }
.gauge__tiers a[aria-current] .gauge__mark {
	background: var(--sd-gold);
	transform: scale(1.15);
}

@media (max-width: 47.5rem) {
	.gauge {
		inset-block: 76px auto;
		margin-block: 0;
		block-size: 34vh;
		gap: 8px;
	}
	.gauge__altitude { font-size: 0.75rem; }
	.gauge__altitude b { font-size: 1.1rem; }
	.gauge__label { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); }
}
</style>

