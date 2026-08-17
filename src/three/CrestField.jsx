import { useMemo, useRef, useLayoutEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { sampleMark } from "./markGeometry";
import { crestVertex, crestFragment, linkVertex, linkFragment } from "./shaders/crestField";
import { stage, damp, clamp, smoothstep, formationWeights } from "../lib/stage";

/* ------------------------------------------------------------------
   The crest field.

   One point cloud. Five target formations. The blueprint asks for a
   single continuous 3D system where the camera travels between
   chapters, so nothing here is created or destroyed on scroll — the
   same particles simply resolve into a different arrangement.
   ------------------------------------------------------------------ */

const INK = new THREE.Color("#e7eaef");
const ACCENT = new THREE.Color("#2f6bff");
const CYAN = new THREE.Color("#46d8e8");

const NODE_COUNT = 88;

/** Architecture lattice: abstract nodes + the paths between them.
 *  Deliberately not server racks — kept abstract and premium (§15). */
function buildNetwork(rng) {
  const nodes = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    // Three loose strata read as app / service / data tiers without
    // ever being literal about it.
    const tier = i % 3;
    nodes.push(
      new THREE.Vector3(
        (rng() - 0.5) * 13,
        (tier - 1) * 2.1 + (rng() - 0.5) * 1.5,
        (rng() - 0.5) * 9 - 1
      )
    );
  }

  const links = [];
  nodes.forEach((n, i) => {
    const near = nodes
      .map((m, j) => ({ j, d: n.distanceTo(m) }))
      .filter((x) => x.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    near.forEach(({ j }) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!links.some((l) => l.key === key)) links.push({ key, a: i, b: j });
    });
  });

  return { nodes, links };
}

/** Deterministic RNG so the composition is identical every load. */
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function CrestField({ count = 20000 }) {
  const points = useRef();
  const lines = useRef();
  const matRef = useRef();
  const linkMatRef = useRef();
  const group = useRef();
  const { size } = useThree();

  const data = useMemo(() => {
    const rng = mulberry32(20260815);
    const { positions: crestPos, layers } = sampleMark(count);
    const { nodes, links } = buildNetwork(rng);

    const scatter = new Float32Array(count * 3);
    const lattice = new Float32Array(count * 3);
    const plane = new Float32Array(count * 3);
    const horizon = new Float32Array(count * 3);
    const rnd = new Float32Array(count * 3);

    // Product surface: a wide, gently curved panel — the finished
    // system folded into a product (§15 Scene 06).
    const cols = Math.ceil(Math.sqrt(count * 1.9));
    const rows = Math.ceil(count / cols);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // --- Scene 01: the void. A deep, sparse shell.
      const r = 7 + rng() * 13;
      const th = rng() * Math.PI * 2;
      const ph = Math.acos(2 * rng() - 1);
      scatter[i3] = Math.sin(ph) * Math.cos(th) * r * 1.35;
      scatter[i3 + 1] = Math.cos(ph) * r * 0.72;
      scatter[i3 + 2] = Math.sin(ph) * Math.sin(th) * r - 4;

      // --- Scene 04: nodes, and the data paths between them.
      if (rng() < 0.45) {
        const l = links[(rng() * links.length) | 0];
        const a = nodes[l.a];
        const b = nodes[l.b];
        const t = rng();
        lattice[i3] = a.x + (b.x - a.x) * t + (rng() - 0.5) * 0.09;
        lattice[i3 + 1] = a.y + (b.y - a.y) * t + (rng() - 0.5) * 0.09;
        lattice[i3 + 2] = a.z + (b.z - a.z) * t + (rng() - 0.5) * 0.09;
      } else {
        const n = nodes[(rng() * nodes.length) | 0];
        const s = 0.16 + rng() * 0.34;
        lattice[i3] = n.x + (rng() - 0.5) * s;
        lattice[i3 + 1] = n.y + (rng() - 0.5) * s;
        lattice[i3 + 2] = n.z + (rng() - 0.5) * s;
      }

      // --- Scene 06: the product surface.
      const cx = i % cols;
      const cy = (i / cols) | 0;
      const u = cols > 1 ? cx / (cols - 1) - 0.5 : 0;
      const v = rows > 1 ? cy / (rows - 1) - 0.5 : 0;
      plane[i3] = u * 15.5;
      plane[i3 + 1] = v * 8.2;
      plane[i3 + 2] = -Math.abs(u) * 2.3 - Math.abs(v) * 1.1 + 0.6;

      // --- Scene 07: the crest returns, larger and more complete.
      const k = 2.55;
      horizon[i3] = crestPos[i3] * k + (rng() - 0.5) * 0.5;
      horizon[i3 + 1] = crestPos[i3 + 1] * k + (rng() - 0.5) * 0.5 + 1.1;
      horizon[i3 + 2] = crestPos[i3 + 2] * k - rng() * 5;

      rnd[i3] = rng();
      rnd[i3 + 1] = rng();
      rnd[i3 + 2] = rng();
    }

    // Link geometry for the visible connections.
    const linkPos = new Float32Array(links.length * 6);
    const linkSeed = new Float32Array(links.length * 2);
    links.forEach((l, i) => {
      const a = nodes[l.a];
      const b = nodes[l.b];
      linkPos.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
      const s = rng();
      linkSeed[i * 2] = s;
      linkSeed[i * 2 + 1] = s;
    });

    return { crestPos, layers, scatter, lattice, plane, horizon, rnd, linkPos, linkSeed };
  }, [count]);

  /* ---- Uniforms -------------------------------------------------
     These objects are only ever used to construct the materials. The
     per-frame loop reads the live uniforms back off the material ref
     instead of mutating these, so they stay genuinely immutable and
     it does not matter whether R3F binds them by reference. */
  const initialUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpen: { value: 0 },
      uWScatter: { value: 1 },
      uWCrest: { value: 0 },
      uWLattice: { value: 0 },
      uWPlane: { value: 0 },
      uWHorizon: { value: 0 },
      uSize: { value: 1.6 },
      uVelocity: { value: 0 },
      uReveal: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uPixelRatio: { value: 1 },
      uProjScale: { value: 815 },
      uFocusLayer: { value: -1 },
      uFadeNear: { value: 9 },
      uFadeFar: { value: 26 },
      uInk: { value: INK },
      uAccent: { value: ACCENT },
      uCyan: { value: CYAN },
    }),
    []
  );

  const initialLinkUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uVelocity: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uAccent: { value: ACCENT },
      uCyan: { value: CYAN },
    }),
    []
  );

  useLayoutEffect(() => {
    const u = matRef.current?.uniforms;
    if (u) u.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2);
  }, [size]);

  /* ---- Per-frame drive ------------------------------------------ */
  const revealRef = useRef(0);
  const openRef = useRef(0);

  useFrame((state, dt) => {
    // Read the uniforms back off the material rather than from the
    // object we passed in: R3F does not guarantee the prop is bound by
    // reference, and writing to a detached copy fails silently — the
    // scene simply renders black.
    const u = matRef.current?.uniforms;
    const lv = linkMatRef.current?.uniforms;
    if (!u) return;

    const d = Math.min(dt, 0.05);
    u.uTime.value = state.clock.elapsedTime;

    // Perspective scale, per frame: the fov animates across the journey
    // and the frame can be resized at any time.
    const cam = state.camera;
    u.uProjScale.value =
      state.size.height / (2 * Math.tan((cam.fov * Math.PI) / 360));

    const ambient = stage.mode === "ambient";
    // Under reduced motion only a few frames ever render, so easing
    // toward a target would never arrive — snap instead.
    const ease = stage.reduced ? (_a, b) => b : damp;

    // Inner pages hold the crest formed and calm; Home drives the arc.
    const p = ambient ? 0.19 : stage.eased;
    const w = formationWeights(p);

    u.uWScatter.value = ease(u.uWScatter.value, w.scatter, 9, d);
    u.uWCrest.value = ease(u.uWCrest.value, w.crest, 9, d);
    u.uWLattice.value = ease(u.uWLattice.value, w.lattice, 9, d);
    u.uWPlane.value = ease(u.uWPlane.value, w.plane, 9, d);
    u.uWHorizon.value = ease(u.uWHorizon.value, w.horizon, 9, d);

    openRef.current = ease(openRef.current, ambient ? 0.12 : w.open, 6, d);
    u.uOpen.value = openRef.current;

    u.uVelocity.value = damp(u.uVelocity.value, clamp(stage.velocity, -1, 1), 7, d);

    const targetReveal = ambient ? 0.42 : 1;
    revealRef.current = ease(revealRef.current, targetReveal, 2.4, d);
    u.uReveal.value = revealRef.current;

    u.uPointer.value.set(stage.pointerEased.x, stage.pointerEased.y);
    u.uFocusLayer.value = damp(u.uFocusLayer.value, stage.focusLayer ?? -1, 10, d);

    // The finale pulls the camera back to ~21 units. Keep the default
    // fade tight enough that the void reads as sparse, then open it up
    // so the enlarged crest is actually legible at that distance.
    const hz = u.uWHorizon.value;
    u.uFadeNear.value = ease(u.uFadeNear.value, 9 + hz * 8, 6, d);
    u.uFadeFar.value = ease(u.uFadeFar.value, 26 + hz * 24, 6, d);

    // Slow orbital rotation — cinematic continuity without spinning.
    // It eases back to square-on across the final chapter: the horizon
    // is the payoff shot, and a crest seen at an angle reads as a
    // smudge rather than as the mark.
    if (group.current) {
      const settle = 1 - smoothstep(0.86, 0.98, p);
      const spin = ambient
        ? state.clock.elapsedTime * 0.018
        : (state.clock.elapsedTime * 0.012 + p * 0.55) * settle;
      group.current.rotation.y = damp(group.current.rotation.y, spin, 3, d);
      group.current.rotation.x = damp(
        group.current.rotation.x,
        stage.pointerEased.y * -0.06,
        3,
        d
      );
    }

    // Links only matter while the architecture is legible.
    if (!lv) return;
    lv.uTime.value = state.clock.elapsedTime;
    lv.uVelocity.value = u.uVelocity.value;
    lv.uPointer.value.copy(u.uPointer.value);
    lv.uReveal.value = damp(
      lv.uReveal.value,
      revealRef.current * (ambient ? 0.12 : u.uWLattice.value * 1.6),
      5,
      d
    );
  });

  return (
    <group ref={group}>
      <points ref={points} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.crestPos, 3]} />
          <bufferAttribute attach="attributes-aCrest" args={[data.crestPos, 3]} />
          <bufferAttribute attach="attributes-aScatter" args={[data.scatter, 3]} />
          <bufferAttribute attach="attributes-aLattice" args={[data.lattice, 3]} />
          <bufferAttribute attach="attributes-aPlane" args={[data.plane, 3]} />
          <bufferAttribute attach="attributes-aHorizon" args={[data.horizon, 3]} />
          <bufferAttribute attach="attributes-aLayer" args={[data.layers, 1]} />
          <bufferAttribute attach="attributes-aRnd" args={[data.rnd, 3]} />
        </bufferGeometry>
        <shaderMaterial
          ref={matRef}
          uniforms={initialUniforms}
          vertexShader={crestVertex}
          fragmentShader={crestFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments ref={lines} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.linkPos, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[data.linkSeed, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={linkMatRef}
          uniforms={initialLinkUniforms}
          vertexShader={linkVertex}
          fragmentShader={linkFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}
