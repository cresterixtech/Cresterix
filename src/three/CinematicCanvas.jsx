import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import * as THREE from "three";
import CrestField from "./CrestField";
import CameraRig from "./CameraRig";
import {
  stage,
  detectQuality,
  prefersReducedMotion,
  densityScale,
  PARTICLES,
  DPR,
} from "../lib/stage";

/* ------------------------------------------------------------------
   The cinematic layer sits behind the entire document, fixed and
   non-interactive. Think of the 3D environment as a cinematic layer
   behind a highly usable website — not a replacement for it (§17).
   ------------------------------------------------------------------ */

function Environment() {
  const { scene } = useThree();
  useEffect(() => {
    scene.fog = new THREE.FogExp2("#05070a", 0.036);
    return () => {
      scene.fog = null;
    };
  }, [scene]);
  return null;
}

/** Dev-only handle on the renderer, for inspecting the scene from the
 *  console. Stripped from production builds. */
function DevHandle() {
  const state = useThree();
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    window.__cx = { state, stage };
    return () => {
      delete window.__cx;
    };
  }, [state]);
  return null;
}

/** Render one frame and stop — the reduced-motion path. */
function StaticRenderer() {
  const { invalidate } = useThree();
  useEffect(() => {
    const ids = [0, 60, 200, 500].map((t) => setTimeout(() => invalidate(), t));
    return () => ids.forEach(clearTimeout);
  }, [invalidate]);
  return null;
}

export default function CinematicCanvas() {
  // Both are resolved during render so the canvas mounts once, at the
  // right quality tier, instead of mounting then re-mounting.
  const [quality] = useState(detectQuality);
  const [reduced, setReduced] = useState(prefersReducedMotion);
  const [hidden, setHidden] = useState(() => document.hidden);
  const [webglFailed, setWebglFailed] = useState(false);
  const holder = useRef();

  useEffect(() => {
    stage.quality = quality;
    stage.reduced = reduced;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduced(mq.matches);
      stage.reduced = mq.matches;
    };
    mq.addEventListener("change", apply);

    // A hidden tab should stop rendering outright. Fading the field to
    // zero while still running the loop costs the same GPU and makes
    // the scene reappear from nothing on return.
    const vis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", vis);

    return () => {
      mq.removeEventListener("change", apply);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [quality, reduced]);

  const [count] = useState(() =>
    Math.round((PARTICLES[quality] ?? PARTICLES.medium) * densityScale())
  );
  const dpr = DPR[quality] ?? DPR.medium;
  const heavyFx = quality === "high" && !reduced;

  const glProps = useMemo(
    () => ({
      antialias: false, // bloom + additive points; AA buys little here
      alpha: false,
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
    }),
    []
  );

  if (webglFailed) {
    // Graceful, still on-brand: the site reads perfectly without WebGL.
    return <div className="cine cine--fallback" aria-hidden="true" />;
  }

  return (
    <div className="cine" ref={holder} aria-hidden="true">
      <Canvas
        dpr={dpr}
        gl={glProps}
        frameloop={reduced || hidden ? "demand" : "always"}
        camera={{ fov: 50, near: 0.1, far: 120, position: [0, 0.2, 17.5] }}
        onCreated={({ gl }) => {
          gl.setClearColor("#05070a", 1);
        }}
        fallback={null}
        onError={() => setWebglFailed(true)}
      >
        <Environment />
        <DevHandle />
        <CameraRig />
        <Suspense fallback={null}>
          <CrestField count={count} />
        </Suspense>
        {reduced && <StaticRenderer />}

        {heavyFx && (
          <EffectComposer multisampling={0} enableNormalPass={false}>
            <Bloom
              intensity={0.72}
              luminanceThreshold={0.16}
              luminanceSmoothing={0.32}
              kernelSize={KernelSize.LARGE}
              mipmapBlur
            />
            <Vignette
              offset={0.28}
              darkness={0.72}
              blendFunction={BlendFunction.NORMAL}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
