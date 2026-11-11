/**
 * Mathematics tier: a gilded armillary sphere hovering off the wall — three rings turning on
 * their own axes around a glowing icosahedron, pierced by a tilted polar axis.
 *
 * It is built up with the tier's path (the timeline the panel steps through): the core is the
 * degree, and each ring outward is a later stage (teaching, then EqualWeb, then today). Until
 * the climb reaches the tier it is all off. A part that is off is dull bronze and faint, half
 * see-through; at its stage it gilds, flares (a ring also turns a little faster) while that stage
 * is in focus, and stays gilded once passed, as the panel's rail stays gold below the focus.
 * A part flashes as the focus comes to it, climbing (as it lights) or going back down (to one
 * already gilded): a burst bright enough to bloom, and a little swell, fading over about a second.
 * One going out just fades.
 */
import * as THREE from 'three';
import { R, yb, tierPos } from '../dimensions';
import { damp, sstep } from '../util';

const GOLD = new THREE.Color(0xe6be78);
const GOLD_GLOW = new THREE.Color(0x3a2508);
const DULL = new THREE.Color(0x5a4c3c);
const FLARE = new THREE.Color(0xb06a14);
/** The tier the sphere hangs on (the experience tier). */
export const ARMILLARY_TIER = 2;
/** how much of a part that is off still shows */
const OFF_OPACITY = 0.22;
/** the core's lines and orb: lit (HDR, so they bloom) and off */
const CORE_LINE = new THREE.Color(2.2, 1.6, 0.8);
const CORE_ORB = new THREE.Color(3, 2.2, 1.1);
const CORE_OFF = new THREE.Color(0.42, 0.36, 0.28);
/** a part's flash as the focus comes to it: HDR gold, so the bloom takes it */
const FLASH = new THREE.Color(3.2, 2.0, 0.75);

/** The flash `age` seconds after the focus came to a part: a quick rise, then a fade over about a second (0 before). */
function flash(age: number) {
	if (age < 0) return 0;
	return age < 0.25 ? sstep(0, 0.25, age) : Math.exp(-(age - 0.25) * 3);
}

export function createArmillary(scene: THREE.Scene) {
	const group = new THREE.Group();
	const baseY = yb(ARMILLARY_TIER) + 3.4;
	group.position.copy(tierPos(ARMILLARY_TIER, R[ARMILLARY_TIER] + 3.6, baseY));

	const gold = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.7, roughness: 0.32, emissive: GOLD_GLOW });
	// the rings, outermost first; each its own material, to gild on its own
	const rings = [1.7, 1.45, 1.2].map((rad) => {
		const mat = gold.clone();
		mat.transparent = true;
		const m = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.045, 8, 90), mat);
		m.castShadow = true;
		group.add(m);
		return { m, mat, gild: 0, hot: 0, angle: 0, focused: false, flashAt: -Infinity };
	});
	rings[1].m.rotation.x = Math.PI / 2;
	rings[2].m.rotation.y = Math.PI / 2;
	const SPEED = [0.35, 0.22, 0.28];

	const coreLine = new THREE.LineBasicMaterial({ color: CORE_OFF.clone(), transparent: true, opacity: OFF_OPACITY });
	const ico = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.75, 0)), coreLine);
	const orbMat = new THREE.MeshBasicMaterial({ color: CORE_OFF.clone(), transparent: true, opacity: OFF_OPACITY });
	const orb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), orbMat);
	// the polar axis goes with the core: off below the tier, gilded from its first stop
	const axisMat = gold.clone();
	axisMat.transparent = true;
	const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 4.2, 6), axisMat);
	axis.rotation.z = 0.41;
	group.add(ico, orb, axis);
	scene.add(group);

	let coreGild = 0;
	let coreHot = 0;
	let coreFocused = false;
	let coreFlashAt = -Infinity;

	/**
	 * Each frame. `level` is the path's stop: 0 the degree (the core) .. 3 today (the outer ring),
	 * or -1 below the tier (all off); every part up to it is gilded. `inView`: the camera is at the
	 * tier (its panel shown), so the part at `level` is in focus; away above it, none is, and coming
	 * back down brings the focus (and its flash) to today's ring again.
	 */
	function update(time: number, dt: number, level: number, inView: boolean) {
		const focus = inView ? level : -1;
		// the ring for level k (1..3) is rings[3 - k]: inner for teaching, outer for today
		rings.forEach((r, i) => {
			const k = 3 - i;
			const focused = focus === k;
			if (focused && !r.focused) r.flashAt = time;
			r.focused = focused;
			const f = flash(time - r.flashAt);
			r.gild += ((level >= k ? 1 : 0) - r.gild) * damp(4, dt);
			r.hot += ((focused ? 1 : 0) - r.hot) * damp(3, dt);
			r.mat.color.copy(DULL).lerp(GOLD, r.gild);
			r.mat.roughness = 0.62 - 0.3 * r.gild;
			r.mat.metalness = 0.45 + 0.25 * r.gild;
			r.mat.emissive.setRGB(0, 0, 0).lerp(GOLD_GLOW, r.gild).lerp(FLARE, r.hot * 0.85).lerp(FLASH, f);
			r.m.scale.setScalar(1 + 0.07 * f);
			r.mat.opacity = OFF_OPACITY + (1 - OFF_OPACITY) * r.gild;
			// a faint ring casts no shadow
			r.m.castShadow = r.gild > 0.5;
			r.angle += dt * SPEED[i] * (1 + 1.6 * r.hot);
		});
		rings[0].m.rotation.y = rings[0].angle;
		rings[1].m.rotation.z = rings[1].angle;
		rings[2].m.rotation.x = rings[2].angle;
		// the core lights at the tier's first stop, and flares while the degree is in focus
		if (focus === 0 && !coreFocused) coreFlashAt = time;
		coreFocused = focus === 0;
		const cf = flash(time - coreFlashAt);
		coreGild += ((level >= 0 ? 1 : 0) - coreGild) * damp(4, dt);
		coreHot += ((coreFocused ? 1 : 0) - coreHot) * damp(3, dt);
		const c = 1 + 0.7 * coreHot + 1.4 * cf;
		coreLine.color.copy(CORE_OFF).lerp(CORE_LINE, coreGild).multiplyScalar(c);
		orbMat.color.copy(CORE_OFF).lerp(CORE_ORB, coreGild).multiplyScalar(c);
		coreLine.opacity = orbMat.opacity = axisMat.opacity = OFF_OPACITY + (1 - OFF_OPACITY) * coreGild;
		axisMat.color.copy(DULL).lerp(GOLD, coreGild);
		axisMat.emissive.setRGB(0, 0, 0).lerp(GOLD_GLOW, coreGild);
		axis.castShadow = coreGild > 0.5;
		orb.scale.setScalar(1 + 0.5 * coreHot + 0.6 * cf);
		ico.scale.setScalar(1 + 0.08 * cf);
		ico.rotation.set(time * 0.4, time * 0.3, 0);
		group.position.y = baseY + Math.sin(time * 0.8) * 0.15;
	}

	/** where the sphere hangs (its rest, without the bob), for the camera to circle */
	const center = group.position.clone();

	return { update, center };
}

