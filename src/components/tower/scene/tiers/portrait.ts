/**
 * Making tier: Baruch's self-portrait (the drawing of him facing a blue screen), hung in a
 * limestone frame beside the guitar strings. The same drawing opens the base tier's panel; here
 * it returns inside the world, next to the strings, where drawing and music are the subject.
 */
import * as THREE from 'three';
import type { Materials } from '../materials';
import { placeAtMakingTier } from './strings';

export interface PortraitSpec {
	/** URL of the drawing (an Astro-processed asset). */
	src: string;
	width: number;
	height: number;
}

/** The drawing's width in world units; the frame adds a limestone border around it. */
const WIDTH = 3.0;
const BORDER = 0.18;

export function createPortrait(scene: THREE.Scene, mats: Materials, spec: PortraitSpec, anisotropy: number) {
	const group = new THREE.Group();
	placeAtMakingTier(group);

	const height = WIDTH * (spec.height / spec.width);
	const texture = new THREE.TextureLoader().load(spec.src);
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.anisotropy = anisotropy;

	// hung slightly askew on the strings' inline side, like a picture nailed up by hand
	const hanging = new THREE.Group();
	hanging.position.set(-3.1, 0.2, 0);
	hanging.rotation.z = 0.02;

	const frame = new THREE.Mesh(new THREE.BoxGeometry(WIDTH + BORDER * 2, height + BORDER * 2, 0.12), mats.limestone);
	frame.castShadow = true;
	const drawing = new THREE.Mesh(
		new THREE.PlaneGeometry(WIDTH, height),
		new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9, metalness: 0 }),
	);
	drawing.position.z = 0.065;
	drawing.receiveShadow = true;

	hanging.add(frame, drawing);
	group.add(hanging);
	scene.add(group);
	return { group };
}

