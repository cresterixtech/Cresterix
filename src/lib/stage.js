/* ------------------------------------------------------------------
   The stage: a single mutable store shared between the DOM and WebGL.

   Scroll updates happen every frame. Routing them through React state
   would re-render the tree 60x/sec, so the 3D layer reads this object
   directly inside useFrame and React never sees the churn.
   ------------------------------------------------------------------ */

export const stage = {
  /** 'journey' — the full 7-scene Home cinematic.
   *  'ambient' — inner pages: same visual language, lighter motion. */
  mode: "ambient",

  /** 0..1 through the current mode's narrative. */
  progress: 0,
  /** Smoothed progress, used by the camera so it never snaps. */
  eased: 0,
  /** Normalised scroll velocity (-1..1). Connections react to this. */
  velocity: 0,

  /** Pointer in NDC (-1..1) for parallax. */
  pointer: { x: 0, y: 0 },
  pointerEased: { x: 0, y: 0 },

  /** Accessibility + capability flags, resolved once on boot. */
  reduced: false,
  quality: "high", // 'high' | 'medium' | 'low'

  /** Route-level tint so inner pages differ subtly from Home. */
  accent: 0,

  /** Capability layer highlighted by a hovered Solutions card (-1 = none). */
  focusLayer: -1,
};

/* ---- Capability queries ------------------------------------------ */

/** Safe to call during render, so it can seed useState lazily and
 *  avoid a cascading re-render on mount. */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function detectQuality() {
  if (typeof window === "undefined") return "high";

  const mem = navigator.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  const narrow = window.innerWidth < 768;

  // `pointer: coarse` reports the *primary* input, so a touchscreen
  // laptop looks identical to a phone and got the mobile budget on a
  // full-size frame — the field then read far too sparse. Only treat it
  // as a touch device when there is no fine pointer available at all.
  const touchOnly =
    window.matchMedia("(any-pointer: coarse)").matches &&
    !window.matchMedia("(any-pointer: fine)").matches;

  if (mem <= 4 || cores <= 4) return "low";
  if (touchOnly || narrow) return "medium";
  return "high";
}

/** Particle budget per tier — the blueprint asks for a separate mobile
 *  composition, not a shrunken desktop scene. */
export const PARTICLES = {
  high: 26000,
  medium: 12000,
  low: 5000,
};

/** The budgets above are authored for a ~1280x760 frame. A desktop
 *  viewport spreads the same cloud over 2x the pixels, which reads as a
 *  thinner, more scattered field than the mobile composition — so grow
 *  the count with the frame. sqrt keeps the growth sane, and the floor
 *  is 1 so the mobile tiers stay exactly as composed.
 *
 *  Resolved once at mount: the field's buffers are keyed on count, so
 *  re-deriving this on resize would rebuild every attribute mid-scroll. */
export function densityScale() {
  if (typeof window === "undefined") return 1;
  const area = window.innerWidth * window.innerHeight;
  return clamp(Math.sqrt(area / (1280 * 760)), 1, 1.45);
}

export const DPR = {
  high: [1, 1.8],
  medium: [1, 1.5],
  low: [1, 1.25],
};

/* ---- Chapter map -------------------------------------------------
   Seven scenes from blueprint §15, expressed as progress ranges.
   The camera spline and the particle morph both read from this.
   ------------------------------------------------------------------ */

export const SCENES = [
  { id: "void", label: "The Void", start: 0.0, end: 0.1 },
  { id: "crest", label: "The Crest Forms", start: 0.1, end: 0.26 },
  { id: "open", label: "The Crest Opens", start: 0.26, end: 0.42 },
  { id: "architecture", label: "The Architecture", start: 0.42, end: 0.58 },
  { id: "engineering", label: "The Engineering Journey", start: 0.58, end: 0.74 },
  { id: "product", label: "The Product Reveal", start: 0.74, end: 0.89 },
  { id: "horizon", label: "The Horizon", start: 0.89, end: 1.0 },
];

/* ---- Chapter anchoring -------------------------------------------
   Scene progress is driven by which section the visitor is actually
   reading, not by a flat fraction of page height. The hero is ~7% of
   the document, so a uniform mapping would have the crest forming
   somewhere down in the capability grid — the motion has to land on
   the copy it belongs to.

   Each entry binds a [data-chapter] element to a slice of the journey.
   ------------------------------------------------------------------ */

export const CHAPTERS = [
  { id: "hero", from: 0.0, to: 0.26 },
  { id: "capabilities", from: 0.26, to: 0.42 },
  { id: "architecture", from: 0.42, to: 0.58 },
  { id: "process", from: 0.58, to: 0.74 },
  { id: "work", from: 0.74, to: 0.89 },
  { id: "finale", from: 0.89, to: 1.0 },
];

/** Local 0..1 position within a named scene, clamped. */
export function sceneT(id, p = stage.eased) {
  const s = SCENES.find((x) => x.id === id);
  if (!s) return 0;
  return clamp01((p - s.start) / (s.end - s.start));
}

/* ---- Small math helpers used across the 3D layer ----------------- */

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;

/** Frame-rate independent exponential smoothing. */
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));

/** Smoothstep with an explicit range. */
export function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Ramp up then back down across a range — used to pulse a scene in/out. */
export function bell(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return Math.sin(t * Math.PI);
}

/* ---- Formation blending -------------------------------------------
   How much each of the five particle formations contributes at a given
   point in the journey. Weights are normalised so the blend is always
   a convex combination and particles never drift off to infinity.
   ------------------------------------------------------------------ */

export function formationWeights(p) {
  const scatter = 1 - smoothstep(0.05, 0.2, p);
  const crest = smoothstep(0.05, 0.2, p) * (1 - smoothstep(0.44, 0.56, p));
  const lattice = smoothstep(0.44, 0.56, p) * (1 - smoothstep(0.74, 0.85, p));
  const plane = smoothstep(0.74, 0.85, p) * (1 - smoothstep(0.88, 0.95, p));
  const horizon = smoothstep(0.88, 0.95, p);

  const sum = scatter + crest + lattice + plane + horizon || 1;
  return {
    scatter: scatter / sum,
    crest: crest / sum,
    lattice: lattice / sum,
    plane: plane / sum,
    horizon: horizon / sum,
    /** Scene 03 — how far the capability layers have pulled apart. */
    open: smoothstep(0.26, 0.44, p),
  };
}
