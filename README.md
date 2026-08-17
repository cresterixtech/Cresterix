# Cresterix — The Crest of Digital Solutions

Implementation of the *Cresterix Advanced Website Content & Experience Blueprint*:
a cinematic, scroll-driven WebGL site over a conventional, accessible document.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
npm run lint
```

React 19 · Vite 8 · React Router 7 · three.js + React Three Fiber · Lenis

---

## Read this first — three things need your input

### 1. Your logo package is broken; the site does not use it

The supplied `Cresterix_Logo_Package` is not production-usable, and its own
README admits the source was a raster logo sheet:

| File | Problem |
|---|---|
| `SVG/*.svg` | Not vectors. Each is a `<image>` tag wrapping a PNG. |
| `PNG/*-White.png` | 1-bit alpha (0% mid-tones) — visibly jagged at hero size. |
| `PNG/*-Black.png` | Alpha channel is 100% opaque — the file is a solid rectangle. |
| `PNG/*-Transparent.png` | 17% partial alpha matted against white — halos on dark backgrounds. |
| `PNG/Cresterix-Full-Logo-*.png` | A stray "48" and a thumbnail are baked into the top-left corner. |

**What was done instead.** The mark and wordmark were re-traced into true vector
geometry from the raster artwork and verified against the originals:

- `src/brand/mark.svg` — 98.7% IoU vs. the source (residual is edge antialiasing)
- `src/brand/wordmark.svg` — 97.3% IoU
- `public/favicon.svg`, `favicon-16/32/48.png`, `apple-touch-icon.png`, `icon-192/512.png`

These are clean, scalable, inherit `currentColor`, and animate. They are good
enough for the website. **They are not a brand master.** For signage, print or
embroidery, have the mark redrawn natively in Illustrator.

### 2. The wordmark has a defect in the source artwork

The two E's in CRESTERIX are built differently:

- **First E** (CR**E**STERIX) — three fully detached bars
- **Second E** (CREST**E**RIX) — top bar detached, middle + bottom joined by a left stem

This is in your original artwork, not introduced by the trace. The site ships the
**faithful** version by default — it is your brand and it is not mine to silently
redraw. A corrected variant is included:

```js
// src/components/Logo.jsx — swap this import to normalise both E's
import wordmarkSvg from "../brand/wordmark.svg";            // faithful (default)
import wordmarkSvg from "../brand/wordmark-normalized.svg"; // both E's as 3 bars
```

Worth putting in front of whoever owns the brand.

### 3. Content gaps are marked, not invented

Blueprint §7 is explicit: *use real project details and measurable outcomes; do
not invent metrics.* Only "Pulse DSR — Sales Intelligence Platform" was named,
with no verified challenge/solution/result copy. So:

- **Case studies** — the system is fully built and data-driven. Pulse DSR carries
  what is genuinely known; every unverified field renders as a visible
  "Awaiting verified content" gap. No placeholder numbers anywhere.
  Fill in `src/data/work.js` and set `status: "published"`.
- **Insights** — the three article titles from §12, each marked `Planned`.
- **Privacy / Terms** — section structure only. Legal text must be written and
  reviewed by counsel; improvising it would be worse than leaving it empty.
- **Social links** — placeholder URLs in `src/components/Footer.jsx`.
- **Contact form** — validates fully, but posts nowhere until you set an endpoint:

  ```bash
  # .env
  VITE_CONTACT_ENDPOINT=https://your-endpoint.example/contact
  ```

  Until then it says so plainly rather than pretending to send.

---

## The cinematic layer

The blueprint asks for *"one continuous 3D system rather than six unrelated
animations."* That is taken literally.

There is a single `<Canvas>` fixed behind the whole document, holding **one**
point cloud. Nothing is created or destroyed on scroll — each particle carries
five target positions and the vertex shader blends between them:

| Formation | Scene | What it is |
|---|---|---|
| `aScatter` | 01 The Void | Sparse spherical shell |
| `aCrest` | 02 The Crest Forms | **Area-weighted samples of the real logo** |
| `aLattice` | 04 The Architecture | Abstract nodes + the paths between them |
| `aPlane` | 06 The Product Reveal | A curved product surface |
| `aHorizon` | 07 The Horizon | The crest again at 2.55× — larger than at the start |

The hero crest is not a stylised approximation. `src/three/markGeometry.js`
triangulates the traced logo and samples it by area, so the field resolves into
the actual Cresterix mark — measured at **94.3% IoU** against the vector, with
99.9% of the mark's interior covered. The mark's ten pieces map onto the five
capability layers the blueprint separates in Scene 03 (Web, Mobile, SaaS, AI,
Cloud), which is what pulls apart as the camera passes between them. Hovering a
capability card highlights its layer in the field.

**Scenes are anchored to sections, not to page percentage.** The hero is ~7% of
the document, so a flat mapping would have the crest forming somewhere down in
the capability grid. Each `[data-chapter]` element in `src/pages/Home.jsx` owns a
slice of the journey (`CHAPTERS` in `src/lib/stage.js`), so every scene plays
over the copy it belongs to.

Scroll never touches React state. `src/lib/stage.js` is a plain mutable object
written by one rAF loop and read inside `useFrame`, so a 60fps scroll costs zero
re-renders.

### Discipline

- **Progressive loading** — the 3D bundle (254 kB gzip) is lazy and only fetched
  after first paint and an idle callback. Initial critical path is ~106 kB gzip.
  A CSS gradient stands in meanwhile, so the page is never visibly empty.
- **Reduced motion** — `prefers-reduced-motion` renders a single static frame
  (`frameloop="demand"`), holds one legible composition, and disables all reveals.
- **Hidden tab** — rendering stops outright rather than animating to invisible.
- **Quality tiers** — 26k / 12k / 5k particles by device memory, cores and
  pointer type. Bloom only on the high tier. Mobile gets its own composition
  rather than a shrunken desktop scene.
- **WebGL failure** — falls back to a static gradient; the site reads fine without it.
- **All copy is real DOM.** Nothing is baked into the canvas.

---

## Accessibility

Every text colour was measured, not eyeballed. All ten routes pass WCAG AA
(4.5:1 normal, 3:1 large) against `--base`:

```
ink 16.34   ink-dim 8.69   ink-mute 4.63   ink-faint 4.64   accent-text 6.23
```

`--accent` (4.38) is a **fill** colour — white on it clears 4.50. `--ink-decor`
is the only sub-AA token and is never used for text.

Also: skip link, visible focus rings, keyboard-navigable menu with Escape,
`aria-live` form results, an error summary that focuses on submit, and required
fields announced to screen readers.

---

## Layout

```
src/
  brand/        traced mark + wordmark, mark-geo.json (drives the 3D)
  data/         site.js (all blueprint copy), work.js (case studies)
  lib/          stage.js (shared state + scene maths), useStageDriver.js, useReveal.js
  three/        CinematicCanvas, CrestField, CameraRig, markGeometry, shaders/
  components/   Nav, Footer, Logo, Button, Reveal, PageHero, ChapterHUD, Boot
  pages/        Home, Solutions, Industries, Work, CaseStudy, About, Insights,
                Contact, Legal, NotFound
  styles/       tokens.css, base.css, ui.css
```

Copy lives in `src/data/`, not in JSX — the wording can be revised without
touching components.

### Two conventions worth knowing

**`src/index.css` is imported before `App` in `main.jsx`, deliberately.**
Component stylesheets are injected in module-execution order. Importing `App`
first puts the shared `.btn` / `.card` rules *after* component rules of equal
specificity and lets the base layer win. That bug hid a broken mobile nav.

**In `src/three/`, never mutate a `useMemo` result that is also passed as a JSX
prop.** The React Compiler may duplicate it across memo blocks, so the render
loop writes to a different object than the one bound to the material. It fails
silently — the scene just renders black. Build the initial object with
`useMemo`, never write to it, and read the live object back off a ref
(`matRef.current.uniforms`) inside `useFrame`. This is why
`react-hooks/immutability` is scoped off for that directory only; see
`eslint.config.js`.

---

## Status

Phase 1 and 2 of the blueprint's launch plan are built: Home, Solutions,
Industries, Work + case-study detail, About, Insights, Contact, plus Privacy,
Terms and 404. Phase 3 (Careers, client portal) is not started.

`npm run lint` and `npm run build` are both clean.
#   C r e s t e r i x  
 