/**
 * Mathematics tier: a gilded armillary sphere hovering off the wall — three rings turning on
 * their own axes around a glowing icosahedron, pierced by a tilted polar axis.
 */
import * as THREE from 'three';
import { R, yb, tierPos } from '../dimensions';

export function createArmillary(scene: THREE.Scene) {
	const group = new THREE.Group();
	const baseY = yb(2) + 3.4;
	group.position.copy(tierPos(2, R[2] + 3.6, baseY));

	const gold = new THREE.MeshStandardMaterial({ color: 0xe6be78, metalness: 0.7, roughness: 0.32, emissive: 0x3a2508 });
	const rings = [1.7, 1.45, 1.2].map((rad) => {
		const m = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.045, 8, 90), gold);
		m.castShadow = true;
		group.add(m);
		return m;
	});
	rings[1].rotation.x = Math.PI / 2;
	rings[2].rotation.y = Math.PI / 2;

	const ico = new THREE.LineSegments(
		new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.75, 0)),
		new THREE.LineBasicMaterial({ color: new THREE.Color(2.2, 1.6, 0.8) }),
	);
	const orb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.2, 1.1) }));
	const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 4.2, 6), gold);
	axis.rotation.z = 0.41;
	group.add(ico, orb, axis);
	scene.add(group);

	function update(time: number) {
		rings[0].rotation.y = time * 0.35;
		rings[1].rotation.z = time * 0.22;
		rings[2].rotation.x = time * 0.28;
		ico.rotation.set(time * 0.4, time * 0.3, 0);
		group.position.y = baseY + Math.sin(time * 0.8) * 0.15;
	}

	return { update };
}

