/**
 * The page's language on the client, for islands that show text: it follows `<html lang>`, so when
 * the language switch changes the page in place, an island that takes its copy for both languages
 * shows the new one without being mounted again.
 *
 * One MutationObserver on the root serves every island; it starts with the first one mounted. On
 * the server (and until mount) the island's own `initial` language is used, so the markup it
 * renders matches the page it's in.
 */
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';
import { isLang, type Lang } from './ui';

const listeners = new Set<(lang: Lang) => void>();
let observer: MutationObserver | null = null;

function current(): Lang | null {
	const lang = document.documentElement.lang;
	return isLang(lang) ? lang : null;
}

function watchRoot() {
	if (observer) return;
	let last = current();
	observer = new MutationObserver(() => {
		const lang = current();
		if (!lang || lang === last) return;
		last = lang;
		listeners.forEach((listener) => listener(lang));
	});
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
}

/** The page's language, as a ref that changes when `<html lang>` does. Call it in a component's setup. */
export function usePageLang(initial: Lang): Ref<Lang> {
	const lang = ref(initial);
	const set = (value: Lang) => {
		lang.value = value;
	};
	onMounted(() => {
		lang.value = current() ?? initial;
		listeners.add(set);
		watchRoot();
	});
	onBeforeUnmount(() => {
		listeners.delete(set);
		if (!listeners.size) {
			observer?.disconnect();
			observer = null;
		}
	});
	return lang;
}

