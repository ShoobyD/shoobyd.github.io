/**
 * The making tier's guitar, heard: each string plays its note in standard tuning (E A D G B E),
 * synthesised in the browser with Karplus-Strong (a pluck circulating through a damped delay line
 * the length of one period), so there are no audio files to load.
 *
 * Voiced as a classical (nylon-string) guitar rather than a steel one: the string is set moving by
 * a soft fingertip-shaped pluck instead of a burst of noise, a low-pass inside the loop lets the
 * high partials die away fast, the notes are shorter, and a gentle "body" (a low-pass plus two
 * warm resonances) shapes the output.
 *
 * Browsers only let a page make sound after a click, tap or key press, so the audio wakes on the
 * visitor's first such gesture anywhere on the page; until then the strings move silently.
 */

/** String frequencies in Hz, indexed like the meshes: 0 is the thinnest (high E), 5 the thickest (low E). */
const NOTES = [329.63, 246.94, 196.0, 146.83, 110.0, 82.41];

/** How long each note rings, in seconds: nylon fades sooner than steel, the low strings last longest. */
const SUSTAIN = [1.8, 2.0, 2.2, 2.5, 2.8, 3.2];

/** Where along the string it is plucked (from the bridge): near the sound hole, as a classical player does. */
const PLUCK_AT = 0.2;

/**
 * The low-pass inside the loop (0–1, lower is darker). It makes the high partials decay much
 * faster than the fundamental, which is most of what separates nylon from steel.
 */
const LOOP_LP = 0.55;

const VOLUME = 0.55;
const GESTURES = ['pointerdown', 'keydown', 'touchend'] as const;

/** One plucked note, rendered into a buffer once and replayed for every pluck. */
function pluckBuffer(ctx: BaseAudioContext, freq: number, sustain: number) {
	const rate = ctx.sampleRate;
	const length = Math.ceil(rate * sustain);
	const buffer = ctx.createBuffer(1, length, rate);
	const out = buffer.getChannelData(0);

	// Tuning. One trip round the loop must take exactly rate / freq samples. Averaging each sample
	// with the next one to be read takes half a sample off, the low-pass adds (1 − a) / a, and the
	// delay line itself can only be a whole number of samples long; a first-order allpass in the
	// loop supplies the remaining fraction, so every string lands on its note (not a few cents off).
	const lpDelay = (1 - LOOP_LP) / LOOP_LP;
	const target = rate / freq - (lpDelay - 0.5);
	const period = Math.max(2, Math.floor(target - 0.1));
	const frac = target - period; // 0.1 … 1.1 samples, where the allpass is accurate
	const allpass = (1 - frac) / (1 + frac);

	// the initial shape of the string: a fingertip pulls it into a triangle peaking at the pluck
	// point, with a breath of noise for life, then smoothed twice so no edge is sharp
	const ring = new Float32Array(period);
	const peakAt = Math.max(1, Math.round(period * PLUCK_AT));
	for (let i = 0; i < period; i++) {
		const shape = i < peakAt ? i / peakAt : (period - i) / (period - peakAt);
		ring[i] = 0.85 * shape + 0.15 * (Math.random() * 2 - 1);
	}
	for (let pass = 0; pass < 2; pass++) {
		let soft = ring[period - 1];
		for (let i = 0; i < period; i++) {
			soft += 0.4 * (ring[i] - soft);
			ring[i] = soft;
		}
	}
	const mean = ring.reduce((sum, v) => sum + v, 0) / period;
	for (let i = 0; i < period; i++) ring[i] -= mean;

	// decay per pass so every string fades to −60 dB at its own sustain
	const rho = Math.pow(0.001, 1 / (freq * sustain));
	let lp = 0;
	let apIn = 0;
	let apOut = 0;
	let peak = 0;
	for (let i = 0, j = 0; i < length; i++) {
		const next = (j + 1) % period;
		const y = ring[j];
		out[i] = y;
		lp += LOOP_LP * (0.5 * (y + ring[next]) - lp);
		const tuned = allpass * lp + apIn - allpass * apOut;
		apIn = lp;
		apOut = tuned;
		ring[j] = rho * tuned;
		j = next;
		peak = Math.max(peak, Math.abs(y));
	}

	// level every string to the same peak, and fade the tail so nothing clicks at the end
	const gain = peak > 0 ? 0.9 / peak : 1;
	const fade = Math.min(length, Math.round(rate * 0.3));
	for (let i = 0; i < length; i++) {
		const tail = i > length - fade ? (length - i) / fade : 1;
		out[i] *= gain * tail;
	}
	return buffer;
}

/** The guitar's body: a soft top end and two warm resonances, then a compressor to keep chords even. */
function createBody(ctx: AudioContext) {
	const top = ctx.createBiquadFilter();
	top.type = 'lowpass';
	top.frequency.value = 3500;
	top.Q.value = 0.6;
	const air = ctx.createBiquadFilter();
	air.type = 'peaking';
	air.frequency.value = 105;
	air.Q.value = 1.1;
	air.gain.value = 4;
	const wood = ctx.createBiquadFilter();
	wood.type = 'peaking';
	wood.frequency.value = 230;
	wood.Q.value = 1.4;
	wood.gain.value = 2.5;
	const compressor = ctx.createDynamicsCompressor();
	top.connect(air).connect(wood).connect(compressor).connect(ctx.destination);
	return top;
}

export function createGuitarSound() {
	let ctx: AudioContext | null = null;
	let master: GainNode | null = null;
	let buffers: AudioBuffer[] = [];

	/** The first gesture creates the audio (inside the gesture, as browsers require) and renders the notes. */
	function wake() {
		if (!ctx) {
			try {
				ctx = new AudioContext();
			} catch {
				// no Web Audio: the strings stay silent
				stopListening();
				return;
			}
			master = ctx.createGain();
			master.gain.value = VOLUME;
			master.connect(createBody(ctx));
			buffers = NOTES.map((f, k) => pluckBuffer(ctx!, f, SUSTAIN[k]));
		}
		if (ctx.state === 'suspended') ctx.resume().catch(() => {});
		if (ctx.state === 'running') stopListening();
	}

	function stopListening() {
		GESTURES.forEach((type) => window.removeEventListener(type, wake, true));
	}

	GESTURES.forEach((type) => window.addEventListener(type, wake, { capture: true, passive: true }));

	return {
		/**
		 * Plays string `k`. `velocity` (0–1) sets how hard it was struck; `pan` (−1–1) places it
		 * across the stereo field. Silent until the first gesture has woken the audio.
		 */
		pluck(k: number, velocity: number, pan: number) {
			// right after the waking gesture the context may still be starting up; a note scheduled
			// then plays as soon as it runs, so only a closed context drops it
			if (!ctx || !master || ctx.state === 'closed' || !buffers[k]) return;
			const source = ctx.createBufferSource();
			source.buffer = buffers[k];
			const gain = ctx.createGain();
			gain.gain.value = Math.min(1, Math.max(0.15, velocity));
			const panner = ctx.createStereoPanner();
			panner.pan.value = Math.min(1, Math.max(-1, pan));
			source.connect(gain).connect(panner).connect(master);
			source.start();
		},
		dispose() {
			stopListening();
			ctx?.close().catch(() => {});
			ctx = null;
			master = null;
			buffers = [];
		},
	};
}

