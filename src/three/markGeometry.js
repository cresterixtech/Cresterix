import * as THREE from "three";
import geo from "../brand/mark-geo.json";

/* ------------------------------------------------------------------
   Turns the traced Cresterix mark into 3D point clouds.

   The particles in the hero are not an abstract "crest" — they are
   area-weighted samples of the real logo outline, so when the field
   converges it resolves into the actual mark.

   The mark's ten pieces are grouped into the five capability layers
   the blueprint separates in Scene 03 (Web, Mobile, SaaS, AI, Cloud).
   ------------------------------------------------------------------ */

const [, , VB_W, VB_H] = geo.viewBox;

/** Target width of the mark in world units. */
export const MARK_WIDTH = 5.2;
const SCALE = MARK_WIDTH / VB_W;

/** Blueprint §15 Scene 03 — each layer represents a capability. */
export const LAYERS = ["Web", "Mobile", "SaaS", "AI", "Cloud"];

/** SVG space (y-down, origin top-left) → world space (y-up, centred). */
function toWorld(x, y) {
  return [(x - VB_W / 2) * SCALE, -(y - VB_H / 2) * SCALE];
}

function shapeFrom(points) {
  const s = new THREE.Shape();
  points.forEach(([x, y], i) => {
    const [wx, wy] = toWorld(x, y);
    if (i === 0) s.moveTo(wx, wy);
    else s.lineTo(wx, wy);
  });
  s.closePath();
  return s;
}

function rectShape(x, y, size) {
  return shapeFrom([
    [x, y],
    [x + size, y],
    [x + size, y + size],
    [x, y + size],
  ]);
}

/** Ten pieces, tagged with the capability layer they belong to. */
function buildPieces() {
  const pieces = [
    { shape: shapeFrom(geo.c), layer: 0 },
    { shape: shapeFrom(geo.xLight[0]), layer: 1 },
    { shape: shapeFrom(geo.xLight[1]), layer: 2 },
    { shape: shapeFrom(geo.xDark), layer: 3 },
  ];
  for (const [x, y, s] of geo.fragments) {
    pieces.push({ shape: rectShape(x, y, s), layer: 4 });
  }
  return pieces;
}

/** Triangulate a shape and return triangles + cumulative area. */
function triangulate(shape) {
  const g = new THREE.ShapeGeometry(shape, 12);
  const pos = g.attributes.position.array;
  const idx = g.index ? g.index.array : null;
  const tris = [];
  let total = 0;

  const count = idx ? idx.length : pos.length / 3;
  for (let i = 0; i < count; i += 3) {
    const a = idx ? idx[i] : i;
    const b = idx ? idx[i + 1] : i + 1;
    const c = idx ? idx[i + 2] : i + 2;
    const ax = pos[a * 3], ay = pos[a * 3 + 1];
    const bx = pos[b * 3], by = pos[b * 3 + 1];
    const cx = pos[c * 3], cy = pos[c * 3 + 1];
    const area = Math.abs((bx - ax) * (cy - ay) - (cx - ax) * (by - ay)) * 0.5;
    if (area <= 0) continue;
    total += area;
    tris.push({ ax, ay, bx, by, cx, cy, cum: total });
  }
  g.dispose();
  return { tris, total };
}

function pickTriangle(tris, total) {
  const r = Math.random() * total;
  let lo = 0;
  let hi = tris.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (tris[mid].cum < r) lo = mid + 1;
    else hi = mid;
  }
  return tris[lo];
}

function samplePoint(t) {
  let u = Math.random();
  let v = Math.random();
  if (u + v > 1) {
    u = 1 - u;
    v = 1 - v;
  }
  const w = 1 - u - v;
  return [
    t.ax * w + t.bx * u + t.cx * v,
    t.ay * w + t.by * u + t.cy * v,
  ];
}

/**
 * Area-weighted sample of the whole mark.
 *
 * @param {number} count number of points
 * @returns {{ positions: Float32Array, layers: Float32Array, bounds: {w:number,h:number} }}
 */
export function sampleMark(count) {
  const pieces = buildPieces().map((p) => ({ ...p, ...triangulate(p.shape) }));
  const grand = pieces.reduce((s, p) => s + p.total, 0);

  const positions = new Float32Array(count * 3);
  const layers = new Float32Array(count);

  // Distribute the budget across pieces by area, so the C (the largest
  // form) reads as dense and the dissolving fragments stay sparse.
  let written = 0;
  pieces.forEach((p, pi) => {
    const share =
      pi === pieces.length - 1
        ? count - written
        : Math.round((p.total / grand) * count);

    for (let i = 0; i < share && written < count; i++, written++) {
      const [x, y] = samplePoint(pickTriangle(p.tris, p.total));
      positions[written * 3] = x;
      positions[written * 3 + 1] = y;
      // Give the plate a little thickness so it catches the camera orbit.
      positions[written * 3 + 2] = (Math.random() - 0.5) * 0.06;
      layers[written] = p.layer;
    }
  });

  return {
    positions,
    layers,
    bounds: { w: VB_W * SCALE, h: VB_H * SCALE },
  };
}

/** Extruded solid version of the mark — used for the crisp hero crest
 *  that sits inside the particle cloud, and for the horizon silhouette. */
export function markExtrudeGeometry({ depth = 0.16, bevel = true } = {}) {
  const shapes = buildPieces().map((p) => p.shape);
  const g = new THREE.ExtrudeGeometry(shapes, {
    depth,
    bevelEnabled: bevel,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 12,
  });
  g.center();
  g.computeVertexNormals();
  return g;
}

/** Outline polylines, for the thin technical wireframe pass. */
export function markOutlines() {
  const lines = [];
  const push = (pts, close = true) => {
    const arr = [];
    pts.forEach(([x, y]) => {
      const [wx, wy] = toWorld(x, y);
      arr.push(wx, wy, 0);
    });
    if (close && pts.length) {
      const [wx, wy] = toWorld(pts[0][0], pts[0][1]);
      arr.push(wx, wy, 0);
    }
    lines.push(new Float32Array(arr));
  };

  push(geo.c);
  push(geo.xDark);
  geo.xLight.forEach((l) => push(l));
  geo.fragments.forEach(([x, y, s]) =>
    push([
      [x, y],
      [x + s, y],
      [x + s, y + s],
      [x, y + s],
    ])
  );
  return lines;
}
