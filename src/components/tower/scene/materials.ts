/**
 * The tower's shared materials, in the palette of the direction contract:
 * limestone cornices, shadow ink, baked ochre, worn timber, and the two self-lit glows.
 */
import * as THREE from 'three';

export function createMaterials() {
	return {
		limestone: new THREE.MeshStandardMaterial({ color: 0xe9e3d3, roughness: 0.85 }),
		ramp: new THREE.MeshStandardMaterial({ color: 0xdccfb3, roughness: 0.9, side: THREE.DoubleSide }),
		ink: new THREE.MeshStandardMaterial({ color: 0x2d2a26, roughness: 1 }),
		pilaster: new THREE.MeshStandardMaterial({ color: 0xa9713a, roughness: 0.95 }),
		wood: new THREE.MeshStandardMaterial({ color: 0x7b5634, roughness: 1 }),
		/** Lit windows: unlit colour scaled past 1 so bloom picks them up at dusk and night. */
		window: new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.6, 0.25) }),
		torch: new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 1.1, 0.4) }),
	};
}

export type Materials = ReturnType<typeof createMaterials>;

