/**
 * Geometry helpers: arch outlines, extrusion and placing a flat piece on the curved wall.
 */
import * as THREE from 'three';

/** A round-topped arch outline, `w` wide and `h` tall, standing on `y0`. */
export function archShape(w: number, h: number, y0 = 0) {
	const s = new THREE.Shape();
	const r = w / 2;
	s.moveTo(-r, y0);
	s.lineTo(-r, y0 + h - r);
	s.absarc(0, y0 + h - r, r, Math.PI, 0, true);
	s.lineTo(r, y0);
	s.lineTo(-r, y0);
	return s;
}

/** The same arch as a hole path (opposite winding), for frames cut around an opening. */
export function archPath(w: number, h: number, y0 = 0) {
	const s = new THREE.Path();
	const r = w / 2;
	s.moveTo(-r, y0);
	s.lineTo(r, y0);
	s.lineTo(r, y0 + h - r);
	s.absarc(0, y0 + h - r, r, 0, Math.PI, false);
	s.lineTo(-r, y0);
	return s;
}

export const extrude = (shape: THREE.Shape, depth: number) =>
	new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 10 });

/** A scratch object for composing instance matrices. */
export const dummy = new THREE.Object3D();

/** The matrix that stands a flat piece on the wall at angle `a`, radius `rad`, height `y`, facing out. */
export function placeWall(a: number, rad: number, y: number, sy = 1) {
	dummy.position.set(Math.cos(a) * rad, y, Math.sin(a) * rad);
	dummy.rotation.set(0, Math.PI / 2 - a, 0);
	dummy.scale.set(1, sy, 1);
	dummy.updateMatrix();
	return dummy.matrix.clone();
}

/** The matrix of a plain upright piece at a position, for scattered instances. */
export function placeAt(x: number, y: number, z: number, scale = 1) {
	dummy.position.set(x, y, z);
	dummy.rotation.set(0, 0, 0);
	dummy.scale.setScalar(scale);
	dummy.updateMatrix();
	return dummy.matrix.clone();
}

/** An instanced mesh filled from a list of matrices. */
export function instanced(
	geo: THREE.BufferGeometry,
	mat: THREE.Material,
	list: THREE.Matrix4[],
	{ cast = false, receive = true } = {},
) {
	const im = new THREE.InstancedMesh(geo, mat, list.length);
	list.forEach((m, i) => im.setMatrixAt(i, m));
	im.castShadow = cast;
	im.receiveShadow = receive;
	return im;
}

