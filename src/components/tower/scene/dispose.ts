/**
 * Frees every GPU resource under a scene: geometries, materials and the textures they hold.
 * Shared resources are collected into sets first, so each is disposed exactly once.
 */
import * as THREE from 'three';

export function disposeScene(scene: THREE.Scene) {
	const geometries = new Set<THREE.BufferGeometry>();
	const materials = new Set<THREE.Material>();
	const textures = new Set<THREE.Texture>();

	scene.traverse((obj) => {
		const mesh = obj as THREE.Mesh;
		if (mesh.geometry) geometries.add(mesh.geometry);
		const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
		if (mat) (Array.isArray(mat) ? mat : [mat]).forEach((m) => materials.add(m));
		if (obj instanceof THREE.InstancedMesh) obj.dispose();
		if (obj instanceof THREE.DirectionalLight || obj instanceof THREE.PointLight) obj.shadow.dispose();
	});

	for (const m of materials) {
		for (const value of Object.values(m)) if (value instanceof THREE.Texture) textures.add(value);
		const uniforms = (m as THREE.ShaderMaterial).uniforms;
		if (uniforms) for (const u of Object.values(uniforms)) if (u.value instanceof THREE.Texture) textures.add(u.value);
		m.dispose();
	}
	geometries.forEach((g) => g.dispose());
	textures.forEach((t) => t.dispose());
	scene.clear();
}

