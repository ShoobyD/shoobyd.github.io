/**
 * The WebGL renderer and its post chain: scene → bloom (for windows, torches and doors) → output
 * (tone mapping + sRGB). Pixel ratio is capped at 2; shadows are PCF from a single sun.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export interface Stage {
	renderer: THREE.WebGLRenderer;
	composer: EffectComposer;
	maxAnisotropy: number;
	setSize(w: number, h: number): void;
	render(dt: number): void;
	dispose(): void;
}

export function createRenderer(
	canvas: HTMLCanvasElement,
	scene: THREE.Scene,
	camera: THREE.Camera,
	{ shadows = true } = {},
): Stage {
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
	renderer.setSize(window.innerWidth, window.innerHeight, false);
	renderer.shadowMap.enabled = shadows;
	renderer.shadowMap.type = THREE.PCFShadowMap;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.0;

	const composer = new EffectComposer(renderer);
	composer.addPass(new RenderPass(scene, camera));
	const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.6, 0.55, 0.92);
	composer.addPass(bloom);
	const output = new OutputPass();
	composer.addPass(output);

	return {
		renderer,
		composer,
		maxAnisotropy: Math.min(8, renderer.capabilities.getMaxAnisotropy()),
		setSize(w, h) {
			renderer.setSize(w, h, false);
			composer.setSize(w, h);
		},
		render(dt) {
			composer.render(dt);
		},
		dispose() {
			bloom.dispose();
			output.dispose();
			composer.dispose();
			renderer.dispose();
		},
	};
}

