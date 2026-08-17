import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { stage, damp, smoothstep } from "../lib/stage";

/* ------------------------------------------------------------------
   Camera choreography.

   Slow dolly, orbital movement and controlled transitions tied to
   scroll (blueprint §16). Keyframed rather than curve-parameterised
   so each pose lands on the scene boundary it belongs to.
   ------------------------------------------------------------------ */

const KEYS = [
  // Scene 01 — The Void: distant, almost nothing to see.
  { p: 0.0, pos: [0, 0.2, 17.5], look: [0, 0, 0], fov: 54 },
  { p: 0.1, pos: [0.5, 0.25, 11.0], look: [0, 0, 0], fov: 50 },
  // Scene 02 — The Crest Forms.
  { p: 0.22, pos: [0, 0, 7.4], look: [0, 0, 0], fov: 46 },
  // Scene 03 — The Crest Opens: the camera passes between the layers.
  { p: 0.34, pos: [1.7, 0.45, 3.0], look: [0.2, 0, -1.4], fov: 58 },
  { p: 0.44, pos: [-0.7, 0.9, -1.4], look: [-0.3, 0.2, -5.0], fov: 62 },
  // Scene 04 — The Architecture: pull back to read the network.
  { p: 0.55, pos: [0, 0.9, 6.8], look: [0, 0, -2.0], fov: 52 },
  // Scene 05 — The Engineering Journey: travel through the system.
  { p: 0.66, pos: [2.4, -0.5, 1.6], look: [-1.2, 0.1, -5.5], fov: 58 },
  { p: 0.73, pos: [-1.8, 0.4, -2.4], look: [0.6, 0, -8.0], fov: 60 },
  // Scene 06 — The Product Reveal: square up to the surface.
  { p: 0.82, pos: [0, 0, 9.8], look: [0, 0, 0], fov: 46 },
  // Scene 07 — The Horizon: exit the system, crest larger than before.
  { p: 0.93, pos: [0, 1.3, 14.0], look: [0, 0.7, 0], fov: 48 },
  { p: 1.0, pos: [0, 2.6, 21.0], look: [0, 1.2, 0], fov: 52 },
];

const AMBIENT = { pos: [0.4, 0.3, 12.5], look: [0, 0, 0], fov: 50 };

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();

function sample(p) {
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1].p < p) i++;
  const k0 = KEYS[i];
  const k1 = KEYS[i + 1];
  const t = smoothstep(k0.p, k1.p, p);

  _a.fromArray(k0.pos);
  _b.fromArray(k1.pos);
  _pos.lerpVectors(_a, _b, t);

  _a.fromArray(k0.look);
  _b.fromArray(k1.look);
  _look.lerpVectors(_a, _b, t);

  return { fov: k0.fov + (k1.fov - k0.fov) * t };
}

export default function CameraRig() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3());
  const ready = useRef(false);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const ambient = stage.mode === "ambient";

    let fov;
    if (ambient) {
      _pos.fromArray(AMBIENT.pos);
      _look.fromArray(AMBIENT.look);
      fov = AMBIENT.fov;
    } else {
      fov = sample(stage.eased).fov;
    }

    // Mouse parallax — extremely subtle, per Scene 01.
    const par = ambient ? 0.5 : 1;
    _pos.x += stage.pointerEased.x * 0.55 * par;
    _pos.y += stage.pointerEased.y * 0.35 * par;

    if (stage.reduced) {
      // No travel: hold a single legible composition.
      camera.position.set(0.4, 0.3, 12.5);
      target.current.set(0, 0, 0);
      camera.lookAt(target.current);
      if (camera.fov !== 50) {
        camera.fov = 50;
        camera.updateProjectionMatrix();
      }
      return;
    }

    const lambda = ready.current ? 3.4 : 40;
    ready.current = true;

    camera.position.x = damp(camera.position.x, _pos.x, lambda, d);
    camera.position.y = damp(camera.position.y, _pos.y, lambda, d);
    camera.position.z = damp(camera.position.z, _pos.z, lambda, d);

    target.current.x = damp(target.current.x, _look.x, lambda, d);
    target.current.y = damp(target.current.y, _look.y, lambda, d);
    target.current.z = damp(target.current.z, _look.z, lambda, d);
    camera.lookAt(target.current);

    const nextFov = damp(camera.fov, fov, 3, d);
    if (Math.abs(nextFov - camera.fov) > 0.01) {
      camera.fov = nextFov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
