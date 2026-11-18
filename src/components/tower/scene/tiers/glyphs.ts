/**
 * Languages tier: letters of many scripts orbit the tower under Genesis 11:1, glowing like embers.
 * They brighten as the camera reaches the tier. Living scripts (Hebrew, Greek, Latin, Han, Arabic,
 * Cyrillic, Devanagari, Ge'ez), the ancient ones of the story's world (cuneiform, hieroglyphs, the
 * ancient Hebrew script, Syriac, runes), and three signs of the tier's other interests (π ∞ ☉).
 *
 * The page's serif covers Hebrew, Latin, Greek and Cyrillic; Han and Arabic every device has. The
 * rest many devices don't, so each comes with a cut of its Noto font holding just its letters here
 * (./fonts, a few KB together), loaded with the tower.
 */
import * as THREE from 'three';
import { TAU, sstep, type Random } from '../util';
import { R, yb } from '../dimensions';
import cuneiform from './fonts/cuneiform.woff2?url';
import hieroglyphs from './fonts/hieroglyphs.woff2?url';
import phoenician from './fonts/phoenician.woff2?url';
import syriac from './fonts/syriac.woff2?url';
import runic from './fonts/runic.woff2?url';
import ethiopic from './fonts/ethiopic.woff2?url';
import devanagari from './fonts/devanagari.woff2?url';
import symbols from './fonts/symbols.woff2?url';

const CHARS = ['א', '𒀭', 'ב', 'ש', 'Ω', '𓂀', 'Λ', 'Σ', 'अ', 'R', 'Q', '𐤀', '語', '言', 'ᚠ', 'ج', 'ע', 'π', 'Φ', '𓋹', 'Ж', 'Я', 'አ', 'ת', 'Δ', '𒂗', 'M', '天', 'ܐ', 'ל', '∞', 'ψ', '𐤌', 'ك', 'G', '𓆣', 'ד', '☉'];
/** The scripts' own fonts (see above), by the family name the canvas asks for. */
const SCRIPT_FONTS: [string, string][] = [
	['SD Cuneiform', cuneiform],
	['SD Hieroglyphs', hieroglyphs],
	['SD Phoenician', phoenician],
	['SD Syriac', syriac],
	['SD Runic', runic],
	['SD Ethiopic', ethiopic],
	['SD Devanagari', devanagari],
	['SD Symbols', symbols],
];
const FONT = `500 86px "Frank Ruhl Libre", "Noto Serif", ${SCRIPT_FONTS.map(([family]) => `"${family}"`).join(', ')}, "Times New Roman", serif`;

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

	// repaint once the fonts have loaded: the scripts' own, and the serif for every script it covers
	// (it loads per unicode-range subset)
	let alive = true;
	const fonts = typeof FontFace === 'function' && document.fonts;
	const own = fonts
		? SCRIPT_FONTS.map(([family, url]) => {
				const face = new FontFace(family, `url(${url}) format('woff2')`);
				fonts.add(face);
				return face.load().catch(() => face);
			})
		: [];
	Promise.all(own)
		// a font that failed (offline) fails the whole load; what did load is painted all the same
		.then(() => (fonts ? fonts.load(FONT, CHARS.join('')).catch(() => null) : null))
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

