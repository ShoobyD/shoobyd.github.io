/**
 * Procedural canvas textures: mudbrick and cloud puffs.
 * Nothing is downloaded; every texture is painted at start-up.
 */
import * as THREE from 'three';
import { TAU, mulberry32, type Rng } from './util';

function canvas(w: number, h: number) {
	const c = document.createElement('canvas');
	c.width = w;
	c.height = h;
	return { c, g: c.getContext('2d')! };
}

/** Coursed mudbrick in seven baked tones, with lime mortar, grain and rain streaks. */
export function brickTexture(rnd: Rng, anisotropy: number) {
	const { c, g } = canvas(1024, 512);
	g.fillStyle = '#7f5530';
	g.fillRect(0, 0, 1024, 512);
	const bh = 32, bw = 64, cols = 16;
	const tones = ['#c98b4a', '#be8143', '#d39a5c', '#b67a3e', '#a9713a', '#cf9452', '#c4884b'];
	for (let row = 0; row < 512 / bh; row++) {
		const off = ((row % 2) * bw) / 2;
		const rowCols: string[] = [];
		for (let k = 0; k < cols; k++) rowCols.push(tones[(rnd() * tones.length) | 0]);
		// one brick past each edge, so the running bond wraps seamlessly
		for (let k = -1; k <= cols; k++) {
			const x = k * bw + off, y = row * bh;
			g.fillStyle = rowCols[((k % cols) + cols) % cols];
			g.fillRect(x + 2, y + 2, bw - 4, bh - 4);
			g.fillStyle = 'rgba(255,236,205,.10)';
			g.fillRect(x + 2, y + 2, bw - 4, 3);
			g.fillStyle = 'rgba(50,28,10,.18)';
			g.fillRect(x + 2, y + bh - 6, bw - 4, 4);
		}
	}
	const img = g.getImageData(0, 0, 1024, 512), d = img.data;
	for (let i = 0; i < d.length; i += 4) {
		const n = (rnd() - 0.5) * 26;
		d[i] += n;
		d[i + 1] += n;
		d[i + 2] += n * 0.8;
	}
	g.putImageData(img, 0, 0);
	// weathering streaks, wrapped across the seam
	for (let k = 0; k < 70; k++) {
		const x = rnd() * 1024, w = 6 + rnd() * 30;
		const gr = g.createLinearGradient(0, 0, 0, 512);
		gr.addColorStop(0, 'rgba(40,24,10,0)');
		gr.addColorStop(1, `rgba(40,24,10,${0.05 + rnd() * 0.1})`);
		g.fillStyle = gr;
		g.fillRect(x, 0, w, 512);
		if (x + w > 1024) g.fillRect(x - 1024, 0, w, 512);
	}
	const tex = new THREE.CanvasTexture(c);
	tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
	tex.colorSpace = THREE.SRGBColorSpace;
	tex.anisotropy = anisotropy;
	return tex;
}

/** A soft cumulus puff of overlapping radial gradients, shaded darker at its belly. */
export function cloudTexture(seed: number) {
	const r = mulberry32(seed);
	const { c, g } = canvas(256, 256);
	for (let i = 0; i < 18; i++) {
		const x = 50 + r() * 156;
		const y = 92 + r() * 70 + (Math.abs(x - 128) / 128) * 20;
		const rad = 26 + r() * 46;
		const gr = g.createRadialGradient(x, y, 0, x, y, rad);
		const shade = y > 140 ? 228 : 255;
		gr.addColorStop(0, `rgba(${shade},${shade},${shade},.55)`);
		gr.addColorStop(0.6, `rgba(${shade},${shade},${shade},.22)`);
		gr.addColorStop(1, 'rgba(255,255,255,0)');
		g.fillStyle = gr;
		g.beginPath();
		g.arc(x, y, rad, 0, TAU);
		g.fill();
	}
	const tex = new THREE.CanvasTexture(c);
	tex.colorSpace = THREE.SRGBColorSpace;
	return tex;
}

