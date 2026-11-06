/**
 * Languages tier: letters of many scripts (Hebrew, Greek, Latin, Han, Arabic, Cyrillic) orbit
 * the tower under Genesis 11:1, glowing like embers. They brighten as the camera reaches the tier.
 */
import * as THREE from 'three';
import { TAU, sstep, type Random } from '../util';
import { R, yb } from '../dimensions';

const CHARS = ['א', 'ב', 'ש', 'Ω', 'Λ', 'Σ', 'R', 'Q', '語', '言', 'ج', 'ע', 'Φ', 'Ж', 'Я', 'ת', 'Δ', 'M', '天', 'ל', 'ψ', 'ك', 'G', 'ד'];
const FONT = '500 86px "Frank Ruhl Libre", "Noto Serif", "Times New Roman", serif';

function draw(c: HTMLCanvasElement, ch: string) {
	const g = c.getContext('2d')!;
	g.clearRect(0, 0, 128, 128);
	g.font = FONT;
	g.textAlign = 'center';
	g.textBaseline = 'middle';
	g.shadowColor = 'rgba(255,190,110,.95)';
	g.shadowBlur = 20;
	g.fillStyle = '#fff3dc';
	g.fillText(ch, 64, 70);
}

export function createGlyphs(scene: THREE.Scene, { rnd, range }: Random) {
	const glyphs = CHARS.map((ch, k) => {
		const c = document.createElement('canvas');
		c.width = c.height = 128;
		draw(c, ch);
		const tex = new THREE.CanvasTexture(c);
		tex.colorSpace = THREE.SRGBColorSpace;
		const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, color: new THREE.Color(1.5, 1.35, 1.2) });
		const sprite = new THREE.Sprite(mat);
		sprite.scale.setScalar(range(1.0, 1.6));
		scene.add(sprite);
		return { ch, c, tex, mat, sprite, a: (k / CHARS.length) * TAU, y: yb(3) + range(1.2, 5.4), r: R[3] + range(2.4, 4.2), speed: range(0.05, 0.11), phase: rnd() * 10 };
	});

	// repaint once the serif has loaded for every script it covers (it loads per unicode-range subset)
	let alive = true;
	document.fonts
		?.load(FONT, CHARS.join(''))
		.then(() => {
			if (!alive) return;
			for (const g of glyphs) {
				draw(g.c, g.ch);
				g.tex.needsUpdate = true;
			}
		})
		.catch(() => {});

	function update(time: number, progress: number) {
		const near = 1 - sstep(0.4, 1.6, Math.abs(progress - 3));
		for (const g of glyphs) {
			const a = g.a + time * g.speed;
			g.sprite.position.set(Math.cos(a) * g.r, g.y + Math.sin(time * 0.7 + g.phase) * 0.3, Math.sin(a) * g.r);
			g.mat.opacity = 0.12 + 0.88 * near;
		}
	}

	return {
		update,
		dispose() {
			alive = false;
		},
	};
}

