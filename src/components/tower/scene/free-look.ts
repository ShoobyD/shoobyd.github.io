/**
 * Dev only, for now: look around the tower freely, SketchUp style. A drag with the wheel button
 * turns the camera about the point it looks at (across: around the tower; up and down: over it or
 * from below), the same drag with Shift held slides the view, and Ctrl + wheel draws it in or out
 * (the plain wheel still scrolls the climb). The view stays where it was left while looking around;
 * once the page scrolls on (or on Esc) it eases back onto the climb's own shot.
 */
import * as THREE from 'three';
import { orbitShot } from './camera-path';
import { clamp, damp } from './util';

export function createFreeLook(camera: THREE.Camera, inUi: (t: EventTarget | null) => boolean) {
	const view = { yaw: 0, pitch: 0, zoom: 1 };
	const pan = new THREE.Vector3();
	const right = new THREE.Vector3(), up = new THREE.Vector3(), center = new THREE.Vector3();
	let drag: { x: number; y: number } | null = null;
	let returning = false;
	let lastProgress = NaN;
	/** The camera's distance from what it looks at, so a slide keeps pace with the pointer. */
	let distance = 30;

	const idle = () => view.yaw === 0 && view.pitch === 0 && view.zoom === 1 && pan.lengthSq() === 0;

	function onMouseDown(e: MouseEvent) {
		if (e.button !== 1 || inUi(e.target)) return;
		e.preventDefault(); // no autoscroll
		drag = { x: e.clientX, y: e.clientY };
		returning = false;
	}
	function onMouseMove(e: MouseEvent) {
		if (!drag) return;
		const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
		drag.x = e.clientX;
		drag.y = e.clientY;
		if (e.shiftKey) {
			const k = distance * 0.0012;
			right.setFromMatrixColumn(camera.matrixWorld, 0);
			up.setFromMatrixColumn(camera.matrixWorld, 1);
			pan.addScaledVector(right, -dx * k).addScaledVector(up, dy * k);
		} else {
			// across: the tower turns with the pointer; down: over it, up: from below
			view.yaw -= dx * 0.006;
			view.pitch = clamp(view.pitch + dy * 0.005, -0.5, 1.3);
		}
	}
	function onMouseUp(e: MouseEvent) {
		if (e.button === 1) drag = null;
	}
	function onWheel(e: WheelEvent) {
		if (!e.ctrlKey || inUi(e.target)) return;
		e.preventDefault(); // not the browser's page zoom
		view.zoom = clamp(view.zoom * Math.exp(e.deltaY * 0.0015), 0.25, 2.5);
		returning = false;
	}
	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape') returning = true;
	}
	window.addEventListener('mousedown', onMouseDown);
	window.addEventListener('mousemove', onMouseMove, { passive: true });
	window.addEventListener('mouseup', onMouseUp);
	window.addEventListener('wheel', onWheel, { passive: false });
	window.addEventListener('keydown', onKey);

	return {
		/** Turns this frame's shot by the free view; `progress` is the climb's, to notice scrolling. */
		apply(shot: { pos: THREE.Vector3; look: THREE.Vector3 }, dt: number, progress: number) {
			if (!drag && !Number.isNaN(lastProgress) && Math.abs(progress - lastProgress) > 1e-4) returning = true;
			lastProgress = progress;
			if (returning) {
				const k = damp(2.5, dt);
				view.yaw -= view.yaw * k;
				view.pitch -= view.pitch * k;
				view.zoom += (1 - view.zoom) * k;
				pan.multiplyScalar(1 - k);
				if (Math.abs(view.yaw) + Math.abs(view.pitch) + Math.abs(view.zoom - 1) + pan.length() < 1e-3) {
					view.yaw = view.pitch = 0;
					view.zoom = 1;
					pan.set(0, 0, 0);
					returning = false;
				}
			}
			distance = shot.pos.distanceTo(shot.look);
			if (idle()) return;
			orbitShot(shot, center.copy(shot.look), view);
			shot.pos.add(pan);
			shot.look.add(pan);
			shot.pos.y = Math.max(shot.pos.y, 0.8); // never under the plain
		},
		dispose() {
			window.removeEventListener('mousedown', onMouseDown);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
			window.removeEventListener('wheel', onWheel);
			window.removeEventListener('keydown', onKey);
		},
	};
}

export type FreeLook = ReturnType<typeof createFreeLook>;

