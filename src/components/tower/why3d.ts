/**
 * `?why3d`: a panel over the page that says why this visitor got the live tower or the still
 * picture, for a phone with no console at hand. It lists what the start checks (reduced motion,
 * Save-Data, WebGL 2 and the GPU behind it), each way the start ended (live, or why not, a lost
 * context later), and the errors and warnings logged on the way: three.js reports a shader that
 * fails to compile there. A copy button takes the lot as text.
 *
 * Without the parameter every call here does nothing.
 */
const on = new URLSearchParams(location.search).has('why3d');

let log: HTMLPreElement | null = null;
const lines: string[] = [];
const t0 = performance.now();

function add(line: string) {
	lines.push(line);
	if (log) log.textContent = lines.join('\n');
}

const stamp = () => `${((performance.now() - t0) / 1000).toFixed(1)}s`;

/** The GPU as WebGL reports it, or why there is none. */
function probe(kind: 'webgl2' | 'webgl') {
	try {
		const gl = document.createElement('canvas').getContext(kind) as WebGLRenderingContext | null;
		if (!gl) return 'unavailable';
		const info = gl.getExtension('WEBGL_debug_renderer_info');
		const gpu = info ? `${gl.getParameter(info.UNMASKED_VENDOR_WEBGL)} / ${gl.getParameter(info.UNMASKED_RENDERER_WEBGL)}` : String(gl.getParameter(gl.RENDERER));
		const max = gl.getParameter(gl.MAX_TEXTURE_SIZE);
		gl.getExtension('WEBGL_lose_context')?.loseContext();
		return `yes, ${gpu}, max texture ${max}`;
	} catch (err) {
		return `threw: ${String(err)}`;
	}
}

function mount() {
	const box = document.createElement('div');
	box.setAttribute('style', 'position:fixed;inset-block-start:0;inset-inline:0;z-index:2147483647;max-block-size:50vh;overflow:auto;padding:10px 12px;background:rgb(0 0 0 / 0.88);color:#f3e6d2;font:12px/1.45 ui-monospace,monospace;direction:ltr;text-align:left');
	const bar = document.createElement('div');
	bar.setAttribute('style', 'display:flex;gap:8px;margin-block-end:6px');
	const button = (label: string, act: () => void) => {
		const b = document.createElement('button');
		b.type = 'button';
		b.textContent = label;
		b.setAttribute('style', 'font:inherit;padding:4px 10px;color:inherit;background:#3a2f25;border:1px solid #8a7356;border-radius:4px');
		b.addEventListener('click', act);
		bar.append(b);
		return b;
	};
	const copy = button('Copy', () => {
		navigator.clipboard?.writeText(lines.join('\n')).then(
			() => (copy.textContent = 'Copied'),
			() => (copy.textContent = 'Copy failed: select the text'),
		);
	});
	button('Close', () => box.remove());
	log = document.createElement('pre');
	log.setAttribute('style', 'margin:0;white-space:pre-wrap;word-break:break-word;user-select:text');
	log.textContent = lines.join('\n');
	box.append(bar, log);
	document.body.append(box);
}

function watchLog() {
	const short = (args: unknown[]) =>
		args
			.map((a) => (a instanceof Error ? `${a.name}: ${a.message}` : typeof a === 'string' ? a : String(a)))
			.join(' ')
			.slice(0, 600);
	for (const level of ['error', 'warn'] as const) {
		const orig = console[level].bind(console);
		console[level] = (...args: unknown[]) => {
			add(`${stamp()} ${level}: ${short(args)}`);
			orig(...args);
		};
	}
	window.addEventListener('error', (e) => add(`${stamp()} uncaught: ${e.message}`));
	window.addEventListener('unhandledrejection', (e) => add(`${stamp()} unhandled rejection: ${short([e.reason])}`));
}

/** Opens the panel with what the start checks. Call once, before the start. */
export function begin() {
	if (!on) return;
	const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
	add(`page: ${location.href}`);
	add(`browser: ${navigator.userAgent}`);
	add(`screen: ${innerWidth}x${innerHeight} css px, dpr ${devicePixelRatio}`);
	add(`reduced motion: ${matchMedia('(prefers-reduced-motion: reduce)').matches ? 'ON (keeps the still picture)' : 'off'}`);
	add(`save-data: ${connection?.saveData ? 'ON (keeps the still picture)' : 'off'}${connection?.effectiveType ? `, network ${connection.effectiveType}` : ''}`);
	add(`?no3d: ${new URLSearchParams(location.search).has('no3d') ? 'ON (keeps the still picture)' : 'off'}`);
	add(`webgl2: ${probe('webgl2')}`);
	add(`webgl1: ${probe('webgl')}`);
	add('--');
	watchLog();
	mount();
}

/** How a start (or the live tower) ended: `live 3D`, or the still picture and why. */
export function outcome(what: string) {
	if (on) add(`${stamp()} ${what}`);
}

