/**
 * Dev only (the dev server with `?tune`): a small panel for tuning the experience tier's shots
 * (PATH_VIEWS) live. Each stop has its yaw, pitch and zoom on sliders, which change the table the
 * scene reads every frame; "go" scrolls to that stop (so its shot is in view while tuning it),
 * "reset" puts a stop (or, "reset all", every stop) back to the values in the source, and "copy"
 * puts the table, as it stands, on the clipboard (and in the console) in the source's own format.
 */
import type { OrbitView } from './dimensions';

const LABELS = ['התואר', 'הוראה', 'EqualWeb', 'היום'];
const FIELDS: { key: keyof OrbitView; min: number; max: number; step: number }[] = [
	{ key: 'yaw', min: -1, max: 1, step: 0.01 },
	{ key: 'pitch', min: -0.6, max: 0.6, step: 0.01 },
	{ key: 'zoom', min: 0.4, max: 1.2, step: 0.01 },
];

export function createPathTuner(views: OrbitView[], section: HTMLElement) {
	const panel = document.createElement('div');
	panel.setAttribute('data-tower-chrome', '');
	panel.dir = 'ltr';
	panel.style.cssText =
		'position:fixed;left:12px;bottom:12px;z-index:9999;padding:10px 12px;background:rgb(20 18 16 / 0.88);color:#eee;font:12px/1.4 ui-monospace,monospace;border-radius:8px;box-shadow:0 6px 24px rgb(0 0 0 / 0.5);max-height:calc(100vh - 24px);overflow:auto';

	const goTo = (k: number) => {
		const hold = section.getBoundingClientRect().height - 1.5 * window.innerHeight;
		window.scrollTo({ top: section.offsetTop + (hold * k) / Math.max(1, views.length - 1), behavior: 'smooth' });
	};
	// the values in the source, for the resets
	const initial = views.map((v) => ({ ...v }));
	const resets: (() => void)[] = [];
	const button = (text: string, onClick: () => void) => {
		const el = document.createElement('button');
		el.textContent = text;
		el.style.cssText = 'font:inherit;padding:1px 8px;cursor:pointer';
		el.addEventListener('click', onClick);
		return el;
	};
	const table = () => views.map((v) => `\t{ yaw: ${v.yaw}, pitch: ${v.pitch}, zoom: ${v.zoom} },`).join('\n');

	views.forEach((v, k) => {
		const box = document.createElement('div');
		box.style.cssText = 'margin-block-end:8px';
		const head = document.createElement('div');
		head.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:8px;margin-block-end:2px';
		const name = document.createElement('b');
		name.textContent = `${k} · ${LABELS[k] ?? ''}`;
		const actions = document.createElement('span');
		actions.style.cssText = 'display:flex;gap:4px';
		const sync: (() => void)[] = [];
		const reset = () => {
			Object.assign(v, initial[k]);
			sync.forEach((fn) => fn());
		};
		resets.push(reset);
		actions.append(button('go', () => goTo(k)), button('reset', reset));
		head.append(name, actions);
		box.append(head);
		for (const f of FIELDS) {
			const row = document.createElement('label');
			row.style.cssText = 'display:grid;grid-template-columns:3.2em 9em 3.4em;align-items:center;gap:6px';
			const label = document.createElement('span');
			label.textContent = f.key;
			const input = document.createElement('input');
			input.type = 'range';
			input.min = String(f.min);
			input.max = String(f.max);
			input.step = String(f.step);
			input.value = String(v[f.key]);
			const out = document.createElement('span');
			out.textContent = v[f.key].toFixed(2);
			sync.push(() => {
				input.value = String(v[f.key]);
				out.textContent = v[f.key].toFixed(2);
			});
			input.addEventListener('input', () => {
				v[f.key] = Number(input.value);
				out.textContent = v[f.key].toFixed(2);
			});
			row.append(label, input, out);
			box.append(row);
		}
		panel.append(box);
	});

	const copy = button('copy', () => {
		const text = table();
		console.log(text);
		navigator.clipboard?.writeText(text).then(
			() => (copy.textContent = 'copied'),
			() => (copy.textContent = 'see console'),
		);
		setTimeout(() => (copy.textContent = 'copy'), 1500);
	});
	const foot = document.createElement('div');
	foot.style.cssText = 'display:flex;gap:6px';
	foot.append(copy, button('reset all', () => resets.forEach((fn) => fn())));
	panel.append(foot);
	document.body.append(panel);
	return () => panel.remove();
}

