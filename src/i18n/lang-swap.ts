/**
 * The language switch, in place: a plain click on the header's switch (EN / עב) fetches the same
 * page in the other language and patches the current one to it, rather than loading it. The two
 * builds are the same page apart from language (same elements, ids and classes), so the elements
 * stay, with every listener and observer on them, the live tower keeps running, and the scroll and
 * the tier stay put; the scene, reading `dir`, glides the tower to the other side.
 *
 * What is patched: `<html lang dir>`; the head's language (title, description, canonical, Open
 * Graph and X tags, hreflang links, the JSON-LD); and the skip link, header and main,
 * walked side by side with the twin: their text, and only the attributes that carry language
 * (LANG_ATTRS). Where an element's content differs in shape (an "(in Hebrew)" mark that only one
 * language has), its content is replaced, but only inside phrasing (a line of text and its links).
 * Islands are left to themselves (they follow `<html lang>`, ./page-lang.ts), and so are the parts
 * scripts fill at runtime (SKIP). Then `site:lang` (./lang-event.ts) tells the page's scripts.
 *
 * Everything is checked before anything is touched: a failed fetch, or a page that doesn't line up,
 * falls back to an ordinary page load. So does a click with a modifier key, and without JavaScript
 * the switch is just the link it is.
 *
 * The address changes with `history.pushState`; Back and Forward switch back the same way.
 */
import { LANG_EVENT, type LangEventDetail } from './lang-event';
import { isLang } from './ui';

/** Attributes that carry language; every other attribute (classes, state, styles) is the page's own. */
const LANG_ATTRS = ['lang', 'dir', 'href', 'hreflang', 'title', 'alt', 'aria-label', 'placeholder', 'data-counter'];
/**
 * Left alone: islands (they follow the page language themselves), what scripts fill at runtime, and
 * `<noscript>` (text in a live page, parsed markup in a fetched one; it holds no language anyway).
 */
const SKIP = 'astro-island, [data-stop-now], [data-static-tower], [data-static-ground], noscript';
/** The parts of the body that hold the page's text, walked against the twin's. */
const REGIONS = ['.sd-skip-link', '.sd-header', '#main'];
/** Content that may be replaced wholesale when its shape differs: a line of text and what's in it. */
const PHRASING = new Set(['A', 'ABBR', 'B', 'BDI', 'BR', 'CITE', 'CODE', 'EM', 'I', 'SMALL', 'SPAN', 'STRONG', 'SUB', 'SUP', 'svg', 'path', 'circle', 'rect', 'g', 'line', 'polyline', 'polygon', 'ellipse', 'use']);

type Op = () => void;

const link = document.querySelector<HTMLAnchorElement>('.sd-header__lang');
const docs = new Map<string, Promise<Document | null>>();
let busy = false;

/** The page at `url`, parsed; null if it can't be had as HTML. Kept, so a switch back is instant. */
function load(url: string): Promise<Document | null> {
	const key = new URL(url, location.href).pathname;
	let doc = docs.get(key);
	if (!doc) {
		doc = fetch(key, { credentials: 'same-origin' })
			.then(async (res) => {
				if (!res.ok || !res.headers.get('content-type')?.includes('text/html')) return null;
				return new DOMParser().parseFromString(await res.text(), 'text/html');
			})
			.catch(() => null);
		docs.set(key, doc);
		// a failure is not kept: the next try fetches again
		doc.then((d) => d || docs.delete(key));
	}
	return doc;
}

/** The nodes that matter in a walk: elements and text (comments and the like are left as they are). */
const nodesOf = (el: Element) => [...el.childNodes].filter((n) => n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.TEXT_NODE);

/** Whether `el`'s whole content is phrasing, so it can be replaced as a whole. */
function isPhrasing(el: Element): boolean {
	return [...el.querySelectorAll('*')].every((d) => PHRASING.has(d.tagName));
}

/** Collects the changes that turn `cur` into `next`; false if their structure doesn't line up. */
function walk(cur: Element, next: Element, ops: Op[]): boolean {
	if (cur.tagName !== next.tagName) return false;
	for (const name of LANG_ATTRS) {
		const want = next.getAttribute(name);
		if (want === cur.getAttribute(name)) continue;
		ops.push(want === null ? () => cur.removeAttribute(name) : () => cur.setAttribute(name, want));
	}
	if (cur.matches(SKIP)) return true;
	const a = nodesOf(cur);
	const b = nodesOf(next);
	const same = a.length === b.length && a.every((n, i) => n.nodeType === b[i].nodeType && (n.nodeType === Node.TEXT_NODE || (n as Element).tagName === (b[i] as Element).tagName));
	if (!same) {
		if (!isPhrasing(cur) || !isPhrasing(next)) return false;
		ops.push(() => cur.replaceChildren(...nodesOf(next).map((n) => document.importNode(n, true))));
		return true;
	}
	for (let i = 0; i < a.length; i++) {
		const n = a[i];
		const m = b[i];
		if (n.nodeType === Node.TEXT_NODE) {
			if (n.nodeValue !== m.nodeValue) ops.push(() => (n.nodeValue = m.nodeValue));
		} else if (!walk(n as Element, m as Element, ops)) return false;
	}
	return true;
}

/** The head's language: each tag found by what it is (its name, property, rel and hreflang). */
function walkHead(next: Document, ops: Op[]): boolean {
	const keyOf = (el: Element) => {
		if (el.tagName === 'TITLE') return 'title';
		if (el.tagName === 'META') {
			const k = el.getAttribute('name') ?? el.getAttribute('property');
			return k ? `meta:${k}` : null;
		}
		if (el.tagName === 'LINK') {
			const rel = el.getAttribute('rel');
			return rel === 'canonical' || rel === 'alternate' ? `link:${rel}:${el.getAttribute('hreflang') ?? ''}` : null;
		}
		if (el.tagName === 'SCRIPT' && el.getAttribute('type') === 'application/ld+json') return 'ld';
		return null;
	};
	const mine = new Map<string, Element>();
	for (const el of document.head.children) {
		const k = keyOf(el);
		if (k) mine.set(k, el);
	}
	for (const el of next.head.children) {
		const k = keyOf(el);
		if (!k) continue;
		const own = mine.get(k);
		if (!own) return false;
		if (k === 'title' || k === 'ld') {
			const text = el.textContent ?? '';
			if (own.textContent !== text) ops.push(() => (own.textContent = text));
		} else {
			for (const name of ['content', 'href']) {
				const want = el.getAttribute(name);
				if (want !== null && want !== own.getAttribute(name)) ops.push(() => own.setAttribute(name, want));
			}
		}
	}
	return true;
}

/** Everything that turns this page into `next`; null if it doesn't line up. */
function plan(next: Document): Op[] | null {
	const lang = next.documentElement.lang;
	if (!isLang(lang)) return null;
	const ops: Op[] = [];
	if (!walkHead(next, ops)) return null;
	for (const sel of REGIONS) {
		const cur = document.querySelector(sel);
		const other = next.querySelector(sel);
		if (!cur || !other || !walk(cur, other, ops)) return null;
	}
	const root = document.documentElement;
	const dir = next.documentElement.dir;
	// last: the islands follow `<html lang>` as it changes, by then the rest is in place
	ops.push(() => {
		root.dir = dir;
		root.lang = lang;
	});
	return ops;
}

/** Switches to the page at `url` in place; `push` adds it to the history (not when coming back to it). */
async function go(url: string, push: boolean) {
	if (busy) return;
	busy = true;
	try {
		const next = await load(url);
		const ops = next && plan(next);
		if (!ops) {
			location.href = url;
			return;
		}
		ops.forEach((op) => op());
		if (push) history.pushState({ sdLang: document.documentElement.lang }, '', url);
		const detail: LangEventDetail = { lang: document.documentElement.lang as LangEventDetail['lang'] };
		window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail }));
	} finally {
		busy = false;
	}
}

if (link && window.DOMParser && typeof history.pushState === 'function') {
	const twin = () => new URL(link.href, location.href);
	link.addEventListener('click', (e) => {
		if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		e.preventDefault();
		// the query (debug flags like ?no3d) carries over; a tier's anchor doesn't, the scroll stays anyway
		void go(twin().pathname + location.search, true);
	});
	// the twin starts loading as the pointer or focus comes to the switch
	const warm = () => void load(twin().href);
	link.addEventListener('pointerenter', warm);
	link.addEventListener('focus', warm);
	link.addEventListener('touchstart', warm, { passive: true });

	// Back and Forward: an entry of the twin's address switches back in place; one on this page (a
	// tier's anchor) is left to the browser; anything else is loaded
	let shownPath = location.pathname;
	window.addEventListener('popstate', () => {
		const path = location.pathname;
		if (path === shownPath) return;
		if (path === twin().pathname) void go(location.href, false);
		else location.reload();
	});
	window.addEventListener(LANG_EVENT, () => {
		shownPath = location.pathname;
	});
}

