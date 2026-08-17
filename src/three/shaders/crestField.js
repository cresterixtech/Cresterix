/* ------------------------------------------------------------------
   Shaders for the crest field — the single particle system that
   carries every scene in the journey.

   Rather than swapping meshes between chapters, each particle holds
   five target positions and the vertex shader blends between them.
   That is what makes the sequence feel like one continuous system
   instead of six unrelated animations (blueprint §6).
   ------------------------------------------------------------------ */

const NOISE = /* glsl */ `
  vec3 hash3(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(dot(hash3(i + vec3(0,0,0)), f - vec3(0,0,0)),
              dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
          mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)),
              dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
      mix(mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)),
              dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
          mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)),
              dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y),
      u.z);
  }
`;

export const crestVertex = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uOpen;       // Scene 03: capability layers pull apart
  uniform float uWScatter;
  uniform float uWCrest;
  uniform float uWLattice;
  uniform float uWPlane;
  uniform float uWHorizon;
  uniform float uSize;
  uniform float uVelocity;
  uniform float uReveal;
  uniform vec2  uPointer;
  uniform float uPixelRatio;
  uniform float uProjScale;   // height / (2*tan(fov/2)) — see below
  uniform float uFocusLayer;  // which capability is highlighted (-1 = none)
  uniform float uFadeNear;    // depth fade window — widens for the
  uniform float uFadeFar;     // horizon, where the camera pulls back

  attribute vec3  aScatter;
  attribute vec3  aCrest;
  attribute vec3  aLattice;
  attribute vec3  aPlane;
  attribute vec3  aHorizon;
  attribute float aLayer;
  attribute vec3  aRnd;

  varying float vAlpha;
  varying float vGlow;
  varying float vLayer;
  varying float vDepth;

  ${NOISE}

  // Scene 03 — the crest splits into architectural layers and the
  // camera passes between them.
  vec3 layerOffset(float layer, float t) {
    float idx = layer - 2.0;                       // -2 .. 2
    return vec3(idx * 0.085, idx * 0.03, idx * 0.72) * t;
  }

  void main() {
    vec3 crestP = aCrest + layerOffset(aLayer, uOpen);

    vec3 pos =
        aScatter * uWScatter
      + crestP   * uWCrest
      + aLattice * uWLattice
      + aPlane   * uWPlane
      + aHorizon * uWHorizon;

    // Organic drift. Strongest in the void, almost still once the
    // crest has locked — motion should mean something.
    float drift = 0.055 + 0.30 * uWScatter;
    float t = uTime * 0.07 + aRnd.x * 12.0;
    vec3 n = vec3(
      noise3(pos * 0.34 + t),
      noise3(pos.yzx * 0.31 - t * 0.8),
      noise3(pos.zxy * 0.29 + t * 0.6)
    );
    pos += n * drift;

    // Scroll velocity shears the field slightly — connections react
    // to how fast the visitor is travelling.
    pos.xy += n.xy * uVelocity * 0.28;

    // Very subtle pointer parallax, depth-weighted.
    pos.xy += uPointer * (0.10 + aRnd.y * 0.16);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vDepth = -mv.z;

    float size = uSize * (0.45 + aRnd.z * 0.9);
    // Fragments (layer 4) read as sharper flecks, matching the mark.
    size *= mix(1.0, 1.45, step(3.5, aLayer));
    // Points must subtend a constant *world* size, not a constant pixel
    // size. uProjScale carries the real perspective term, so a taller
    // frame scales the particles with it instead of leaving them tiny in
    // a bigger picture — and they now respond to the 46-62deg fov moves.
    // 0.01718 recalibrates to the old hand-tuned 14.0 at the reference
    // frame (760px tall, 50deg), so the composition is unchanged there.
    gl_PointSize = size * uPixelRatio * uProjScale * 0.01718 / max(vDepth, 0.35);

    gl_Position = projectionMatrix * mv;

    float distFade = 1.0 - smoothstep(uFadeNear, uFadeFar, vDepth);
    // Fade anything the camera is about to fly through. Without this,
    // near particles stack additively into blown-out blobs during the
    // passes between layers and through the architecture.
    float nearFade = smoothstep(0.35, 2.6, vDepth);
    vAlpha = uReveal * distFade * nearFade * (0.30 + aRnd.z * 0.70);

    // Highlight one capability layer when a Solutions card is hovered.
    float focus = uFocusLayer < 0.0
      ? 1.0
      : (abs(aLayer - uFocusLayer) < 0.5 ? 1.0 : 0.22);
    vAlpha *= focus;

    vGlow = uWCrest * 0.55 + uWLattice * 0.85 + uWHorizon * 0.7
          + abs(uVelocity) * 0.5;
    vLayer = aLayer;
  }
`;

export const crestFragment = /* glsl */ `
  precision highp float;

  uniform vec3 uInk;
  uniform vec3 uAccent;
  uniform vec3 uCyan;

  varying float vAlpha;
  varying float vGlow;
  varying float vLayer;
  varying float vDepth;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    // Soft core + falloff halo.
    float core = smoothstep(0.5, 0.0, d);
    float alpha = pow(core, 1.7) * vAlpha;
    if (alpha < 0.004) discard;

    // Colour drifts from off-white toward the accent as energy rises,
    // with cyan reserved for the outer capability layers.
    vec3 c = mix(uInk, uAccent, clamp(vGlow, 0.0, 1.0) * 0.75);
    c = mix(c, uCyan, smoothstep(2.5, 4.0, vLayer) * 0.55);
    c += vec3(0.06, 0.10, 0.18) * (1.0 - smoothstep(0.0, 0.35, d));

    gl_FragColor = vec4(c, alpha);
  }
`;

/* ---- Connection lines (Scene 04) --------------------------------- */

export const linkVertex = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uReveal;
  uniform float uVelocity;
  uniform vec2  uPointer;
  attribute float aSeed;
  varying float vFade;
  varying float vSeed;

  void main() {
    vec3 pos = position;
    pos.xy += uPointer * 0.09;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float depth = -mv.z;
    vFade = uReveal * (1.0 - smoothstep(8.0, 24.0, depth));
    vSeed = aSeed;
  }
`;

export const linkFragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uVelocity;
  uniform vec3  uAccent;
  uniform vec3  uCyan;
  varying float vFade;
  varying float vSeed;

  void main() {
    // A pulse travels each connection; speed tracks scroll velocity so
    // the network visibly reacts to the visitor.
    float speed = 0.35 + abs(uVelocity) * 2.4;
    float pulse = fract(vSeed - uTime * speed);
    float head = smoothstep(0.0, 0.06, pulse) * (1.0 - smoothstep(0.06, 0.30, pulse));

    vec3 c = mix(uAccent, uCyan, vSeed);
    float a = vFade * (0.055 + head * 0.65);
    if (a < 0.004) discard;
    gl_FragColor = vec4(c, a);
  }
`;
