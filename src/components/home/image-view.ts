/**
 * An image enlarged in a native modal <dialog>, growing out of where it was clicked and shrinking
 * back into it on close (a FLIP: the large image starts exactly over the source, at the same place,
 * size and tilt, and animates to its own place). Esc, the close form or a click on the backdrop
 * close it, all through the same shrink; focus returns to the trigger (native <dialog>). With
 * reduced motion it opens and closes at once.
 *
 * The look stays with each user (the self-portrait's mat, a project's screenshot): this module
 * only knows the dialog, the element that moves, and where it comes from.
 */

/** Where the large image grows from: a box on screen, and its tilt there. */
export interface ImageViewSource {
	rect: DOMRect;
	/** Degrees. */
	tilt?: number;
}

export interface ImageViewOptions {
	view: HTMLDialogElement;
	/** The element that grows and shrinks (the large image, or its frame). */
	big: HTMLElement;
	/** Where it grows from right now; null grows it from its own place (a fade only). */
	source: () => ImageViewSource | null;
	/** Hidden while the dialog is open, so the image seems to leave it (the small copy, if any). */
	hide?: HTMLElement;
	/** Fade in after the image arrives, and out first on close (a caption, the close button). */
	extras?: HTMLElement[];
	/** A `<form method="dialog">` whose submit closes it. */
	closeForm?: HTMLFormElement | null;
}

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
const duration = 520;

export function createImageView(o: ImageViewOptions) {
	const { view, big, hide } = o;
	const extras = o.extras ?? [];
	let closing = false;

	/** The transform that lays the large image over its source, as that sits right now. */
	function fromSource() {
		const src = o.source();
		if (!src) return 'scale(0.96)';
		const large = big.getBoundingClientRect();
		const dx = src.rect.x + src.rect.width / 2 - (large.x + large.width / 2);
		const dy = src.rect.y + src.rect.height / 2 - (large.y + large.height / 2);
		const scale = src.rect.width / large.width;
		return `translate(${dx}px, ${dy}px) scale(${scale}) rotate(${src.tilt ?? 0}deg)`;
	}

	function backdrop(keyframes: Keyframe[]) {
		try {
			view.animate(keyframes, { duration, easing, fill: 'forwards', pseudoElement: '::backdrop' });
		} catch {
			// a browser that cannot animate ::backdrop just shows it at once
		}
	}

	function open() {
		if (view.open || typeof view.showModal !== 'function') return;
		view.showModal();
		if (reduced.matches) return;
		const from = fromSource();
		if (hide) hide.style.visibility = 'hidden';
		big.animate([{ transform: from }, { transform: 'none' }], { duration, easing });
		backdrop([{ opacity: 0 }, { opacity: 1 }]);
		extras.forEach((el) =>
			el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: duration * 0.6, easing, fill: 'backwards' }),
		);
	}

	async function close() {
		if (closing || !view.open) return;
		if (reduced.matches) {
			view.close();
			return;
		}
		closing = true;
		extras.forEach((el) => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' }));
		backdrop([{ opacity: 1 }, { opacity: 0 }]);
		const shrink = big.animate([{ transform: 'none' }, { transform: fromSource() }], { duration, easing, fill: 'forwards' });
		await shrink.finished.catch(() => {});
		view.close();
		if (hide) hide.style.visibility = '';
		view.getAnimations({ subtree: true }).forEach((a) => a.cancel());
		closing = false;
	}

	// every way out runs the shrink: Esc (cancel), the close form, a click on the backdrop
	view.addEventListener('cancel', (e) => {
		e.preventDefault();
		close();
	});
	o.closeForm?.addEventListener('submit', (e) => {
		e.preventDefault();
		close();
	});
	view.addEventListener('click', (e) => {
		if (e.target === view) close();
	});
	view.addEventListener('close', () => {
		if (hide) hide.style.visibility = '';
	});

	return { open, close };
}

