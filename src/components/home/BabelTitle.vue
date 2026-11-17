<script setup lang="ts">
/**
 * The summit heading's Babel joke: on arrival (and again on hover or click) the visible heading
 * is confused through several languages, each one scrambling in through random letters of many
 * scripts, before it settles back on the real text.
 *
 * Pure DOM, so it works with or without the 3D tower. Screen readers only ever get `text` (the
 * visible, scrambling copy is aria-hidden). With reduced motion the languages simply swap,
 * without the scrambling letters, and the joke plays only on hover or click.
 *
 * It takes its copy for both languages and shows the page's (it follows `<html lang>`, so a language
 * switch in place changes it too, once a running joke has settled).
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { usePageLang } from '../../i18n/page-lang';
import type { Lang } from '../../i18n/ui';

export interface BabelCopy {
	/** The real heading. */
	text: string;
	/** The languages it passes through before settling back on `text`. */
	sequence: string[];
}

const props = defineProps<{
	/** The page's language when it was rendered. */
	lang: Lang;
	copies: Record<Lang, BabelCopy>;
}>();

const pageLang = usePageLang(props.lang);
const copy = computed(() => props.copies[pageLang.value]);

/** Letter pools of the scripts the heading gets confused with. */
const POOLS = ['אבגדהוזחטיכלמנסעפצקרשת', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'ΑΒΓΔΘΛΞΠΣΦΨΩ', '語言塔天通巴別亂說話', 'АБВГДЖЗИЛПФЦЧШЯ', 'ابتثجحخدرزسشص'];
const STEP_MS = 430;
const STILL_STEP_MS = 380;

const root = ref<HTMLElement | null>(null);
const shown = ref(copy.value.text);

let busy = false;
let still = false;
let raf = 0;
let timer = 0;
let trigger: HTMLElement | null = null;
let seen: IntersectionObserver | null = null;

const pick = (s: string) => s.charAt((Math.random() * s.length) | 0);

/** Scrambles from the current text to `target`; each letter settles at its own moment. */
function scrambleTo(target: string, ms: number) {
	return new Promise<void>((resolve) => {
		if (still) {
			shown.value = target;
			timer = window.setTimeout(resolve, STILL_STEP_MS);
			return;
		}
		const start = performance.now();
		const len = Math.max(shown.value.length, target.length);
		const settle = Array.from({ length: len }, () => 0.15 + Math.random() * 0.75);
		const frame = (now: number) => {
			const t = Math.min(1, (now - start) / ms);
			let out = '';
			for (let j = 0; j < len; j++) {
				const ch = target.charAt(j);
				if (t >= settle[j]) out += ch;
				else if (ch === ' ') out += ' ';
				else out += pick(POOLS[(Math.random() * POOLS.length) | 0]);
			}
			shown.value = out;
			if (t < 1) raf = requestAnimationFrame(frame);
			else {
				shown.value = target;
				resolve();
			}
		};
		raf = requestAnimationFrame(frame);
	});
}

async function babel() {
	if (busy) return;
	busy = true;
	for (const word of [...copy.value.sequence, copy.value.text]) await scrambleTo(word, STEP_MS);
	// the language may have changed while it played
	shown.value = copy.value.text;
	busy = false;
}

watch(copy, (c) => {
	if (!busy) shown.value = c.text;
});

onMounted(() => {
	still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	// the whole heading is the hover / click target, not just the text run
	trigger = root.value?.closest<HTMLElement>('h1, h2, h3') ?? root.value;
	trigger?.addEventListener('pointerenter', babel);
	trigger?.addEventListener('click', babel);

	// play once by itself when the summit is reached (its section has risen past 60% of the viewport)
	const section = root.value?.closest('section');
	if (section && !still) {
		seen = new IntersectionObserver(
			(entries) => {
				if (!entries.some((e) => e.isIntersecting)) return;
				seen?.disconnect();
				timer = window.setTimeout(babel, 500);
			},
			{ rootMargin: '0px 0px -40% 0px' },
		);
		seen.observe(section);
	}
});

onBeforeUnmount(() => {
	trigger?.removeEventListener('pointerenter', babel);
	trigger?.removeEventListener('click', babel);
	seen?.disconnect();
	cancelAnimationFrame(raf);
	clearTimeout(timer);
});
</script>

<template>
	<span ref="root" class="babel">
		<span class="sd-visually-hidden">{{ copy.text }}</span>
		<span class="babel__shown" dir="auto" aria-hidden="true">{{ shown }}</span>
	</span>
</template>

<style scoped>
/* one line while it scrambles, so the panel below does not jump as the width changes */
.babel__shown {
	display: inline-block;
	white-space: nowrap;
	cursor: default;
}
</style>

